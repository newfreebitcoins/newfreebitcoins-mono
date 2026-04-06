export const CLIENT_CONFIG = {
  backendEndpoint: "https://newfreebitcoins.com",
  electrum: {
    mainnet: {
      host: "electrum.blockstream.info",
      port: 50002,
      protocol: "tls"
    },
    regtest: {
      host: "127.0.0.1",
      port: 50001,
      protocol: "tcp"
    }
  }
};
