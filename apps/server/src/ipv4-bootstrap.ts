import dns from "node:dns";

// Força resolução IPv4 primeiro para evitar ENETUNREACH em ambientes sem IPv6
dns.setDefaultResultOrder("ipv4first");

// Carrega a aplicação após configurar a ordem de resolução DNS
import("./index.js");
