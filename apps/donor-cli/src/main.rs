use std::{
    fs,
    io::{self, Write},
    path::PathBuf,
    str::FromStr,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use anyhow::{anyhow, bail, Context, Result};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use bip39::{Language, Mnemonic};
use bitcoin::{
    absolute::LockTime,
    address::NetworkUnchecked,
    bip32::{DerivationPath, Xpriv},
    ecdsa::Signature as BitcoinEcdsaSignature,
    key::{CompressedPublicKey, Secp256k1},
    sighash::{EcdsaSighashType, SighashCache},
    transaction::Version,
    Address, Amount, Network, OutPoint, PrivateKey, PublicKey, ScriptBuf, Sequence, Transaction,
    TxIn, TxOut, Txid, Witness,
};
use clap::{Parser, Subcommand};
use pbkdf2::pbkdf2_hmac;
use rand::{seq::SliceRandom, RngCore};
use reqwest::Client;
use secp256k1::{ecdsa::Signature, Message};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tokio::time::sleep;

const STORAGE_DIR: &str = "NewFreeBitcoins";
const STORAGE_FILE: &str = "donor-wallet.json";
const PBKDF2_ITERATIONS: u32 = 250_000;
const DUST_THRESHOLD: u64 = 546;
const WIDTH: usize = 66;

#[derive(Parser)]
#[command(name = "donor-cli")]
#[command(about = "CLI donation wallet for New Free Bitcoins")]
struct Cli {
    #[arg(long)]
    password: Option<String>,
    #[arg(long, default_value = "http://localhost:3001")]
    backend: String,
    #[arg(long)]
    data_dir: Option<PathBuf>,
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Start {
        #[arg(long)]
        max_requests: Option<usize>,
    },
    Balance,
    Activity {
        #[arg(long, default_value_t = 20)]
        limit: usize,
    },
    Send {
        #[arg(long)]
        address: String,
        #[arg(long)]
        amount_sats: u64,
    },
    Config,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StoredWallet {
    network: String,
    address: String,
    derivation_path: String,
    created_at: String,
    cipher_text: String,
    salt: String,
    iv: String,
    #[serde(default = "default_max_requests_per_tx")]
    max_requests_per_tx: usize,
    #[serde(default = "default_fee_rate_sat_per_vbyte")]
    fee_rate_sat_per_vbyte: u64,
}

#[derive(Debug, Clone)]
struct DecryptedWallet {
    mnemonic: Mnemonic,
    address: String,
    network: Network,
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
struct ConfigResponse {
    network: String,
    unitLabel: String,
    donations: DonationsConfig,
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
struct DonationsConfig {
    heartbeatPollMs: u64,
    executionPollMs: u64,
}

#[derive(Debug, Deserialize)]
struct BalanceResponse {
    confirmed: i64,
    unconfirmed: i64,
}

#[derive(Debug, Deserialize)]
struct WalletUtxosResponse {
    utxos: Vec<Utxo>,
}

#[derive(Debug, Clone, Deserialize)]
struct Utxo {
    txid: String,
    vout: u32,
    value: u64,
    height: i64,
}

#[derive(Debug, Deserialize)]
struct ChallengeResponse {
    challenge: String,
}

#[derive(Debug, Deserialize)]
struct ReserveRequestsResponse {
    requests: Vec<ReservedRequest>,
}

#[derive(Debug, Clone, Deserialize)]
#[allow(non_snake_case)]
struct ReservedRequest {
    id: u64,
    bitcoinAddress: String,
    amountSats: u64,
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
struct TxStatusResponse {
    confirmed: bool,
    confirmations: i64,
    txid: String,
    explorerUrl: Option<String>,
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
struct SendTransactionResponse {
    txid: String,
    explorerUrl: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ActivityResponse {
    items: Vec<ActivityItem>,
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
struct ActivityItem {
    #[serde(rename = "type")]
    item_type: String,
    amountSats: u64,
    requestCount: Option<u64>,
    occurredAt: Option<String>,
    txid: String,
    explorerUrl: Option<String>,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
struct HeartbeatRequest<'a> {
    address: &'a str,
    publicKeyHex: String,
    challenge: &'a str,
    signatureHex: String,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
struct ReserveRequest<'a> {
    donorAddress: &'a str,
    maxRequests: usize,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
struct FulfillmentSubmitRequest<'a> {
    donorAddress: &'a str,
    requestIds: Vec<u64>,
    rawTransactionHex: &'a str,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
struct SendTransactionRequest<'a> {
    donorAddress: &'a str,
    rawTransactionHex: &'a str,
}

fn default_storage_dir() -> Result<PathBuf> {
    dirs::data_local_dir()
        .or_else(dirs::home_dir)
        .map(|path| path.join(STORAGE_DIR))
        .ok_or_else(|| anyhow!("Unable to determine a local storage directory."))
}

fn wallet_file_path(data_dir: Option<&PathBuf>) -> Result<PathBuf> {
    let base = match data_dir {
        Some(path) => path.clone(),
        None => default_storage_dir()?,
    };
    Ok(base.join(STORAGE_FILE))
}

fn default_max_requests_per_tx() -> usize {
    1
}

fn default_fee_rate_sat_per_vbyte() -> u64 {
    2
}

fn format_sats_as_btc(sats: u64, unit_label: &str) -> String {
    format!("{:.8} {}", sats as f64 / 100_000_000.0, unit_label)
}

fn parse_network(value: &str) -> Result<Network> {
    match value {
        "mainnet" => Ok(Network::Bitcoin),
        "regtest" => Ok(Network::Regtest),
        other => bail!("Unsupported backend network: {other}"),
    }
}

fn derive_key_material(password: &str, salt: &[u8]) -> [u8; 32] {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, PBKDF2_ITERATIONS, &mut key);
    key
}

fn encrypt_mnemonic(mnemonic: &str, password: &str) -> Result<(String, String, String)> {
    let mut salt = [0u8; 16];
    let mut iv = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut salt);
    rand::thread_rng().fill_bytes(&mut iv);

    let key = derive_key_material(password, &salt);
    let cipher = Aes256Gcm::new_from_slice(&key).context("Unable to initialize wallet cipher")?;
    let encrypted = cipher
        .encrypt(Nonce::from_slice(&iv), mnemonic.as_bytes())
        .map_err(|_| anyhow!("Unable to encrypt mnemonic"))?;

    Ok((
        BASE64.encode(encrypted),
        BASE64.encode(salt),
        BASE64.encode(iv),
    ))
}

fn decrypt_mnemonic(stored: &StoredWallet, password: &str) -> Result<String> {
    let salt = BASE64
        .decode(stored.salt.as_bytes())
        .context("Stored wallet salt is invalid")?;
    let iv = BASE64
        .decode(stored.iv.as_bytes())
        .context("Stored wallet IV is invalid")?;
    let cipher_text = BASE64
        .decode(stored.cipher_text.as_bytes())
        .context("Stored wallet ciphertext is invalid")?;

    let key = derive_key_material(password, &salt);
    let cipher = Aes256Gcm::new_from_slice(&key).context("Unable to initialize wallet cipher")?;
    let decrypted = cipher
        .decrypt(Nonce::from_slice(&iv), cipher_text.as_ref())
        .map_err(|_| anyhow!("Unable to decrypt wallet with that password"))?;

    Ok(String::from_utf8(decrypted).context("Decrypted mnemonic was not valid UTF-8")?)
}

fn derive_address_and_key(
    mnemonic: &Mnemonic,
    network: Network,
) -> Result<(String, DerivationPath, PrivateKey, PublicKey)> {
    let coin_type = match network {
        Network::Bitcoin => 0,
        Network::Regtest => 1,
        _ => bail!("Unsupported network"),
    };

    let seed = mnemonic.to_seed_normalized("");
    let xpriv = Xpriv::new_master(network, &seed).context("Unable to derive master key")?;
    let derivation_path = DerivationPath::from_str(&format!("m/84'/{coin_type}'/0'/0/0"))
        .context("Unable to construct derivation path")?;
    let secp = Secp256k1::new();
    let child = xpriv
        .derive_priv(&secp, &derivation_path)
        .context("Unable to derive child private key")?;
    let private_key = PrivateKey::new(child.private_key, network);
    let public_key = private_key.public_key(&secp);
    let compressed_public_key = CompressedPublicKey::from_private_key(&secp, &private_key)
        .context("Unable to compress public key")?;
    let address = Address::p2wpkh(&compressed_public_key, network).to_string();

    Ok((address, derivation_path, private_key, public_key))
}

fn prompt_line(prompt: &str) -> Result<String> {
    print!("{prompt}");
    io::stdout().flush().context("Unable to flush stdout")?;
    let mut input = String::new();
    io::stdin()
        .read_line(&mut input)
        .context("Unable to read input")?;
    Ok(input.trim().to_string())
}

fn clear_screen() -> Result<()> {
    print!("\x1B[2J\x1B[1;1H");
    io::stdout().flush().context("Unable to flush stdout")
}

fn print_rule() {
    println!("{}", "=".repeat(WIDTH));
}

fn print_header(title: &str, subtitle: &str) {
    print_rule();
    println!("{:^width$}", title, width = WIDTH);
    if !subtitle.is_empty() {
        println!("{:^width$}", subtitle, width = WIDTH);
    }
    print_rule();
    println!();
}

fn print_section(title: &str) {
    println!("{title}");
    println!("{}", "-".repeat(title.len()));
}

fn print_kv(label: &str, value: &str) {
    println!("{label:<16} {value}");
}

fn print_status(prefix: &str, text: &str) {
    println!("[{prefix}] {text}");
}

fn print_success(text: &str) {
    print_status("ok", text);
}

fn pause_for_enter(prompt: &str) -> Result<()> {
    println!("{prompt}");
    let _ = prompt_line("Press Enter to continue...")?;
    Ok(())
}

fn prompt_usize_with_default(prompt: &str, default: usize, min: usize, max: usize) -> Result<usize> {
    let answer = prompt_line(&format!("{prompt} [{default}]: "))?;
    if answer.trim().is_empty() {
        return Ok(default);
    }

    let value = answer
        .trim()
        .parse::<usize>()
        .context("Please enter a valid whole number.")?;
    Ok(value.clamp(min, max))
}

fn prompt_u64_with_default(prompt: &str, default: u64, min: u64, max: u64) -> Result<u64> {
    let answer = prompt_line(&format!("{prompt} [{default}]: "))?;
    if answer.trim().is_empty() {
        return Ok(default);
    }

    let value = answer
        .trim()
        .parse::<u64>()
        .context("Please enter a valid whole number.")?;
    Ok(value.clamp(min, max))
}

fn prompt_password_value(prompt: &str) -> Result<String> {
    rpassword::prompt_password(prompt).context("Unable to read password input")
}

fn prompt_new_password() -> Result<String> {
    let password = prompt_password_value("Choose a wallet password: ")?;
    if password.trim().is_empty() {
        bail!("Password cannot be empty.");
    }

    let confirm = prompt_password_value("Confirm the wallet password: ")?;
    if password != confirm {
        bail!("Password confirmation did not match.");
    }

    Ok(password)
}

fn print_mnemonic_grid(mnemonic: &Mnemonic) {
    let words: Vec<_> = mnemonic.words().collect();
    println!();
    for row_start in (0..words.len()).step_by(2) {
        let left = format!("{:>2}. {:<12}", row_start + 1, words[row_start]);
        let right = if let Some(word) = words.get(row_start + 1) {
            format!("{:>2}. {}", row_start + 2, word)
        } else {
            String::new()
        };
        println!("{left}    {right}");
    }
    println!();
}

fn confirm_mnemonic_words(mnemonic: &Mnemonic) -> Result<()> {
    let mut indexes: Vec<usize> = (0..12).collect();
    indexes.shuffle(&mut rand::thread_rng());
    indexes.truncate(4);
    indexes.sort_unstable();

    let words: Vec<_> = mnemonic.words().collect();
    for index in indexes {
        let answer = prompt_line(&format!("What was word {}? ", index + 1))?;
        if answer.trim().to_lowercase() != words[index].to_lowercase() {
            bail!("Mnemonic confirmation failed. Run the command again to create a new wallet.");
        }
    }

    Ok(())
}

fn save_wallet(
    data_dir: Option<&PathBuf>,
    mnemonic: &Mnemonic,
    password: &str,
    backend_network: Network,
) -> Result<DecryptedWallet> {
    let path = wallet_file_path(data_dir)?;
    let storage_dir = path
        .parent()
        .ok_or_else(|| anyhow!("Unable to determine wallet storage directory."))?;
    fs::create_dir_all(storage_dir).context("Unable to create wallet storage directory")?;

    let (address, _derivation_path, _private_key, _public_key) =
        derive_address_and_key(&mnemonic, backend_network)?;
    let (cipher_text, salt, iv) = encrypt_mnemonic(&mnemonic.to_string(), password)?;
    let stored = StoredWallet {
        network: match backend_network {
            Network::Bitcoin => "mainnet".to_string(),
            Network::Regtest => "regtest".to_string(),
            _ => unreachable!(),
        },
        address: address.clone(),
            derivation_path: _derivation_path.to_string(),
        created_at: chrono_timestamp_string()?,
        cipher_text,
        salt,
        iv,
        max_requests_per_tx: default_max_requests_per_tx(),
        fee_rate_sat_per_vbyte: default_fee_rate_sat_per_vbyte(),
    };

    fs::write(&path, serde_json::to_vec_pretty(&stored)?).context("Unable to save wallet")?;

    println!();
    print_section("Wallet Created");
    print_kv("Address", &address);
    print_kv("Saved At", &path.display().to_string());
    println!();

    Ok(DecryptedWallet { mnemonic: mnemonic.clone(), address, network: backend_network })
}

fn load_stored_wallet(data_dir: Option<&PathBuf>) -> Result<StoredWallet> {
    let path = wallet_file_path(data_dir)?;
    let raw = fs::read(&path).context("Unable to read stored donor wallet")?;
    serde_json::from_slice(&raw).context("Stored donor wallet is invalid JSON")
}

fn write_stored_wallet(data_dir: Option<&PathBuf>, stored: &StoredWallet) -> Result<()> {
    let path = wallet_file_path(data_dir)?;
    fs::write(&path, serde_json::to_vec_pretty(stored)?).context("Unable to save wallet")
}

fn prompt_import_mnemonic() -> Result<Mnemonic> {
    let phrase = prompt_line("Enter your 12-word mnemonic phrase: ")?;
    Mnemonic::parse_in_normalized(Language::English, phrase.trim())
        .context("That mnemonic phrase is invalid.")
}

fn prompt_create_wallet(data_dir: Option<&PathBuf>, backend_network: Network) -> Result<DecryptedWallet> {
    clear_screen()?;
    print_header("NEW FREE BITCOINS", "Create Donation Wallet");
    print_kv("Network", &format!("{backend_network:?}"));
    println!();
    print_section("Step 1: Choose A Password");
    println!("This password encrypts your locally saved mnemonic.");
    println!();
    let password = prompt_new_password()?;
    let mnemonic = Mnemonic::generate_in(Language::English, 12)
        .context("Unable to generate mnemonic phrase")?;

    clear_screen()?;
    print_header("NEW FREE BITCOINS", "Write Down Your Mnemonic");
    println!("Write down this mnemonic phrase exactly as shown.");
    println!("The mnemonic is the real backup for this wallet.");
    println!();
    print_mnemonic_grid(&mnemonic);
    pause_for_enter("Once you have written it down safely, continue to the confirmation step.")?;
    clear_screen()?;
    print_header("NEW FREE BITCOINS", "Confirm Your Mnemonic");
    confirm_mnemonic_words(&mnemonic)?;
    save_wallet(data_dir, &mnemonic, &password, backend_network)
}

fn prompt_import_wallet(data_dir: Option<&PathBuf>, backend_network: Network) -> Result<DecryptedWallet> {
    clear_screen()?;
    print_header("NEW FREE BITCOINS", "Import Donation Wallet");
    print_kv("Network", &format!("{backend_network:?}"));
    println!();
    print_section("Step 1: Enter Your Mnemonic");
    let mnemonic = prompt_import_mnemonic()?;
    println!();
    print_section("Step 2: Choose A Password");
    let password = prompt_new_password()?;
    clear_screen()?;
    print_header("NEW FREE BITCOINS", "Confirm Your Mnemonic");
    println!("Confirm a few words from your mnemonic phrase.");
    println!();
    confirm_mnemonic_words(&mnemonic)?;
    save_wallet(data_dir, &mnemonic, &password, backend_network)
}

fn chrono_timestamp_string() -> Result<String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .context("System time is invalid")?
        .as_secs();
    Ok(now.to_string())
}

fn prompt_initial_wallet_setup(
    data_dir: Option<&PathBuf>,
    backend_network: Network,
) -> Result<DecryptedWallet> {
    clear_screen()?;
    print_header("NEW FREE BITCOINS", "Donor CLI Setup");
    println!("No donor wallet was found for this data directory.");
    println!();
    print_section("Choose A Setup Option");
    println!("1. Create a new donation wallet");
    println!("2. Import an existing mnemonic");
    println!();

    let choice = prompt_line("Choose 1 or 2: ")?;
    match choice.trim() {
        "1" => prompt_create_wallet(data_dir, backend_network),
        "2" => prompt_import_wallet(data_dir, backend_network),
        _ => bail!("Invalid choice. Run the command again and choose 1 or 2."),
    }
}

fn load_or_create_wallet(
    data_dir: Option<&PathBuf>,
    password: Option<&str>,
    backend_network: Network,
) -> Result<DecryptedWallet> {
    let path = wallet_file_path(data_dir)?;

    if !path.exists() {
        return prompt_initial_wallet_setup(data_dir, backend_network);
    }

    let password =
        password.ok_or_else(|| anyhow!("This wallet already exists. Re-run the command with --password to unlock it."))?;

    let stored = load_stored_wallet(data_dir)?;

    let stored_network = parse_network(&stored.network)?;
    if stored_network != backend_network {
        bail!(
            "Stored wallet was created for {} but backend is using {}.",
            stored.network,
            match backend_network {
                Network::Bitcoin => "mainnet",
                Network::Regtest => "regtest",
                _ => "unknown",
            }
        );
    }

    let mnemonic_text = decrypt_mnemonic(&stored, password)?;
    let mnemonic = Mnemonic::parse_in_normalized(Language::English, &mnemonic_text)
        .context("Stored mnemonic could not be parsed")?;
    let (address, _derivation_path, _private_key, _public_key) =
        derive_address_and_key(&mnemonic, backend_network)?;

    if address != stored.address {
        bail!("Stored wallet address does not match derived mnemonic address.");
    }

    Ok(DecryptedWallet { mnemonic, address, network: backend_network })
}

fn load_wallet_settings(data_dir: Option<&PathBuf>) -> Result<(usize, u64)> {
    let stored = load_stored_wallet(data_dir)?;
    Ok((stored.max_requests_per_tx, stored.fee_rate_sat_per_vbyte))
}

fn run_config_tui(data_dir: Option<&PathBuf>) -> Result<()> {
    let mut stored = load_stored_wallet(data_dir)?;
    clear_screen()?;
    print_header("NEW FREE BITCOINS", "CLI Wallet Configuration");
    print_kv("Address", &stored.address);
    print_kv("Network", &stored.network);
    println!();
    print_section("Current Settings");
    print_kv("Max Requests", &stored.max_requests_per_tx.to_string());
    print_kv("Sats/vbyte", &stored.fee_rate_sat_per_vbyte.to_string());
    println!();
    print_section("Update Settings");
    stored.max_requests_per_tx = prompt_usize_with_default(
        "Max requests per transaction",
        stored.max_requests_per_tx,
        1,
        25
    )?;
    stored.fee_rate_sat_per_vbyte = prompt_u64_with_default(
        "Fee rate (sats/vbyte)",
        stored.fee_rate_sat_per_vbyte,
        1,
        500
    )?;
    write_stored_wallet(data_dir, &stored)?;
    println!();
    print_success("Wallet settings saved.");
    print_kv("Max Requests", &stored.max_requests_per_tx.to_string());
    print_kv("Sats/vbyte", &stored.fee_rate_sat_per_vbyte.to_string());
    Ok(())
}

async fn get_json<T: DeserializeOwned>(client: &Client, url: &str) -> Result<T> {
    let response = client.get(url).send().await.context("HTTP request failed")?;
    let status = response.status();
    if !status.is_success() {
        let text = response.text().await.unwrap_or_default();
        bail!("Request failed with {status}: {text}");
    }
    Ok(response.json::<T>().await.context("Invalid JSON response")?)
}

async fn post_json<T: DeserializeOwned, P: Serialize>(
    client: &Client,
    url: &str,
    payload: &P,
) -> Result<T> {
    let response = client
        .post(url)
        .json(payload)
        .send()
        .await
        .context("HTTP request failed")?;
    let status = response.status();
    if !status.is_success() {
        let text = response.text().await.unwrap_or_default();
        bail!("Request failed with {status}: {text}");
    }
    Ok(response.json::<T>().await.context("Invalid JSON response")?)
}

fn address_string(address: &str, network: Network) -> Result<Address> {
    let unchecked = Address::<NetworkUnchecked>::from_str(address)
        .context("Invalid Bitcoin address")?;
    Ok(unchecked
        .require_network(network)
        .context("Address does not match the current backend network")?)
}

fn build_tx(
    wallet: &DecryptedWallet,
    utxos: &[Utxo],
    outputs: &[(Address, u64)],
    fee_rate_sat_per_vbyte: u64,
) -> Result<String> {
    let secp = Secp256k1::new();
    let (_addr, _path, private_key, public_key) =
        derive_address_and_key(&wallet.mnemonic, wallet.network)?;
    let wallet_address = address_string(&wallet.address, wallet.network)?;
    let wallet_script_pubkey = wallet_address.script_pubkey();
    let script_pubkey = wallet_address.script_pubkey();

    let mut selected_inputs = Vec::new();
    let mut total_input_value = 0u64;
    let total_output_value: u64 = outputs.iter().map(|(_, value)| *value).sum();

    let mut sorted_utxos = utxos
        .iter()
        .filter(|utxo| utxo.height > 0)
        .cloned()
        .collect::<Vec<_>>();
    sorted_utxos.sort_by_key(|utxo| utxo.value);

    for utxo in sorted_utxos {
        selected_inputs.push(utxo.clone());
        total_input_value += utxo.value;
        let fee_with_change =
            estimate_fee(selected_inputs.len() as u64, outputs.len() as u64 + 1, fee_rate_sat_per_vbyte);

        if total_input_value >= total_output_value + fee_with_change {
            break;
        }
    }

    if selected_inputs.is_empty() {
        bail!("This donation wallet has no confirmed spendable UTXOs.");
    }

    let mut fee = estimate_fee(
        selected_inputs.len() as u64,
        outputs.len() as u64 + 1,
        fee_rate_sat_per_vbyte,
    );
    let mut change_value = total_input_value as i64 - total_output_value as i64 - fee as i64;
    let has_change = change_value as u64 > DUST_THRESHOLD;

    if !has_change {
        fee = estimate_fee(
            selected_inputs.len() as u64,
            outputs.len() as u64,
            fee_rate_sat_per_vbyte,
        );
        change_value = total_input_value as i64 - total_output_value as i64 - fee as i64;
    }

    if change_value < 0 {
        bail!("This donation wallet does not have enough confirmed funds.");
    }

    let mut transaction = Transaction {
        version: Version(2),
        lock_time: LockTime::ZERO,
        input: Vec::new(),
        output: outputs
            .iter()
            .map(|(address, value)| TxOut {
                value: Amount::from_sat(*value),
                script_pubkey: address.script_pubkey(),
            })
            .collect(),
    };

    for utxo in &selected_inputs {
        transaction.input.push(TxIn {
            previous_output: OutPoint {
                txid: Txid::from_str(&utxo.txid).context("Invalid UTXO txid")?,
                vout: utxo.vout,
            },
            script_sig: ScriptBuf::new(),
            sequence: Sequence::ENABLE_RBF_NO_LOCKTIME,
            witness: Witness::default(),
        });
    }

    if has_change && change_value as u64 > DUST_THRESHOLD {
        transaction.output.push(TxOut {
            value: Amount::from_sat(change_value as u64),
            script_pubkey: wallet_script_pubkey.clone(),
        });
    }

    for (index, utxo) in selected_inputs.iter().enumerate() {
        let sighash = SighashCache::new(&transaction).p2wpkh_signature_hash(
            index,
            &script_pubkey,
            Amount::from_sat(utxo.value),
            EcdsaSighashType::All,
        )?;
        let message = Message::from_digest_slice(sighash.as_ref())?;
        let signature = secp.sign_ecdsa(&message, &private_key.inner);
        let bitcoin_signature = BitcoinEcdsaSignature {
            signature,
            sighash_type: EcdsaSighashType::All,
        };

        let mut witness = Witness::new();
        witness.push(bitcoin_signature.serialize());
        witness.push(public_key.to_bytes());
        transaction.input[index].witness = witness;
    }

    Ok(bitcoin::consensus::encode::serialize_hex(&transaction))
}

fn estimate_fee(input_count: u64, output_count: u64, fee_rate_sat_per_vbyte: u64) -> u64 {
    let virtual_bytes = 11 + input_count * 68 + output_count * 31;
    virtual_bytes * fee_rate_sat_per_vbyte
}

async fn run_start_loop(
    client: &Client,
    backend: &str,
    config: &ConfigResponse,
    wallet: &DecryptedWallet,
    max_requests: usize,
    fee_rate_sat_per_vbyte: u64,
) -> Result<()> {
    let secp = Secp256k1::new();
    let (_address, _path, private_key, public_key) =
        derive_address_and_key(&wallet.mnemonic, wallet.network)?;
    let mut last_heartbeat_at = 0u128;
    let mut pending_txid: Option<String> = None;

    loop {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .context("System time is invalid")?
            .as_millis();
        if now.saturating_sub(last_heartbeat_at) >= config.donations.heartbeatPollMs as u128 {
            let challenge: ChallengeResponse =
                get_json(client, &format!("{backend}/api/donations/challenge")).await?;
            let challenge_hex = challenge.challenge;
            let challenge_bytes = hex::decode(&challenge_hex)?;
            let digest = Sha256::digest(challenge_bytes);
            let message = Message::from_digest_slice(&digest)?;
            let signature: Signature = secp.sign_ecdsa(&message, &private_key.inner);
            let payload = HeartbeatRequest {
                address: &wallet.address,
                publicKeyHex: hex::encode(public_key.to_bytes()),
                challenge: &challenge_hex,
                signatureHex: hex::encode(signature.serialize_compact()),
            };
            let _: serde_json::Value =
                post_json(client, &format!("{backend}/api/donations/heartbeat"), &payload)
                    .await?;
            last_heartbeat_at = now;
            print_status("heartbeat", &format!("Accepted for {}", wallet.address));
        }

        if let Some(txid) = pending_txid.clone() {
            let status: TxStatusResponse = get_json(
                client,
                &format!("{backend}/api/donations/tx-status?txid={txid}"),
            )
            .await?;

            if status.confirmed {
                println!(
                    "[confirmed] donation tx {}{}",
                    status.txid,
                    status
                        .explorerUrl
                        .as_deref()
                        .map(|url| format!(" ({url})"))
                        .unwrap_or_default()
                );
                pending_txid = None;
            } else {
                println!(
                    "[pending] waiting for confirmation on {} ({} confirmations)",
                    status.txid, status.confirmations
                );
                sleep(Duration::from_millis(config.donations.executionPollMs)).await;
                continue;
            }
        }

        let reserve_payload = ReserveRequest {
            donorAddress: &wallet.address,
            maxRequests: max_requests,
        };
        let reserve: ReserveRequestsResponse = post_json(
            client,
            &format!("{backend}/api/donations/reserve-requests"),
            &reserve_payload,
        )
        .await?;

        if reserve.requests.is_empty() {
            print_status("queue", "No queued faucet requests right now.");
            sleep(Duration::from_millis(config.donations.executionPollMs)).await;
            continue;
        }

        let utxos: WalletUtxosResponse = get_json(
            client,
            &format!("{backend}/api/donations/wallet-utxos?address={}", wallet.address),
        )
        .await?;

        let outputs = reserve
            .requests
            .iter()
            .map(|request| {
                Ok((
                    address_string(&request.bitcoinAddress, wallet.network)?,
                    request.amountSats,
                ))
            })
            .collect::<Result<Vec<_>>>()?;

        let raw_tx = build_tx(
            wallet,
            &utxos.utxos,
            &outputs,
            fee_rate_sat_per_vbyte,
        )?;

        let submit_payload = FulfillmentSubmitRequest {
            donorAddress: &wallet.address,
            requestIds: reserve.requests.iter().map(|request| request.id).collect(),
            rawTransactionHex: &raw_tx,
        };
        let submit: SendTransactionResponse = post_json(
            client,
            &format!("{backend}/api/donations/submit-fulfillment"),
            &submit_payload,
        )
        .await?;

        println!(
            "[broadcast] faucet fulfillment tx {}{}",
            submit.txid,
            submit
                .explorerUrl
                .as_deref()
                .map(|url| format!(" ({url})"))
                .unwrap_or_default()
        );
        pending_txid = Some(submit.txid);
        sleep(Duration::from_millis(config.donations.executionPollMs)).await;
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let client = Client::builder()
        .build()
        .context("Unable to create HTTP client")?;

    let config: ConfigResponse =
        get_json(&client, &format!("{}/api/config", cli.backend)).await?;
    let backend_network = parse_network(&config.network)?;
    let wallet_exists = wallet_file_path(cli.data_dir.as_ref())?.exists();

    if matches!(cli.command, Commands::Config) && !wallet_exists {
        bail!("No donor wallet exists yet. Run any wallet command first to create or import one.");
    }

    if matches!(cli.command, Commands::Config) {
        run_config_tui(cli.data_dir.as_ref())?;
        return Ok(());
    }

    let wallet = load_or_create_wallet(cli.data_dir.as_ref(), cli.password.as_deref(), backend_network)?;
    let (configured_max_requests, configured_fee_rate_sat_per_vbyte) =
        load_wallet_settings(cli.data_dir.as_ref())?;
    clear_screen()?;
    print_header("NEW FREE BITCOINS", "Donor CLI");
    print_kv("Backend", &cli.backend);
    print_kv("Network", &config.network);
    print_kv("Address", &wallet.address);
    println!();

    match cli.command {
        Commands::Balance => {
            let balance: BalanceResponse = get_json(
                &client,
                &format!("{}/api/wallet/balance?address={}", cli.backend, wallet.address),
            )
            .await?;
            print_section("Wallet Balance");
            print_kv("Confirmed", &format_sats_as_btc(balance.confirmed.max(0) as u64, &config.unitLabel));
            print_kv("Unconfirmed", &format_sats_as_btc(balance.unconfirmed.unsigned_abs(), &config.unitLabel));
        }
        Commands::Activity { limit } => {
            let activity: ActivityResponse = get_json(
                &client,
                &format!(
                    "{}/api/donations/activity?address={}&limit={}",
                    cli.backend, wallet.address, limit
                ),
            )
            .await?;
            print_section("Recent Activity");
            if activity.items.is_empty() {
                println!("No activity yet.");
            } else {
                for item in activity.items {
                    let label = match item.item_type.as_str() {
                        "faucet_fulfillment" => format!(
                            "Fulfilled {} faucet request{}",
                            item.requestCount.unwrap_or(0),
                            if item.requestCount.unwrap_or(0) == 1 { "" } else { "s" }
                        ),
                        "send" => "Sent".to_string(),
                        _ => "Deposit".to_string(),
                    };
                    println!();
                    print_kv("Type", &label);
                    print_kv("Amount", &format_sats_as_btc(item.amountSats, &config.unitLabel));
                    print_kv("When", &item.occurredAt.unwrap_or_else(|| "Pending".to_string()));
                    print_kv("Tx", &item.explorerUrl.unwrap_or(item.txid));
                }
            }
        }
        Commands::Send { address, amount_sats } => {
            let destination = address_string(&address, wallet.network)?;
            let utxos: WalletUtxosResponse = get_json(
                &client,
                &format!("{}/api/donations/wallet-utxos?address={}", cli.backend, wallet.address),
            )
            .await?;
            let raw_tx =
                build_tx(&wallet, &utxos.utxos, &[(destination, amount_sats)], configured_fee_rate_sat_per_vbyte)?;
            let payload = SendTransactionRequest {
                donorAddress: &wallet.address,
                rawTransactionHex: &raw_tx,
            };
            let sent: SendTransactionResponse = post_json(
                &client,
                &format!("{}/api/donations/send-transaction", cli.backend),
                &payload,
            )
            .await?;
            print_section("Manual Send Complete");
            print_kv("Amount", &format_sats_as_btc(amount_sats, &config.unitLabel));
            print_kv("To", &address);
            print_kv("Txid", &sent.txid);
            if let Some(url) = sent.explorerUrl.as_deref() {
                print_kv("Explorer", url);
            }
        }
        Commands::Start { max_requests } => {
            let max_requests = max_requests.unwrap_or(configured_max_requests);
            print_section("Donation Loop");
            print_kv("Mode", "Running");
            print_kv("Max Requests", &max_requests.to_string());
            print_kv("Sats/vbyte", &configured_fee_rate_sat_per_vbyte.to_string());
            println!();
            run_start_loop(
                &client,
                &cli.backend,
                &config,
                &wallet,
                max_requests,
                configured_fee_rate_sat_per_vbyte
            )
            .await?;
        }
        Commands::Config => unreachable!(),
    }

    Ok(())
}
