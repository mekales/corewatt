let apiUrl;

if (window.location.hostname === "localhost" || window.location.hostname.startsWith("192.168.")) {
  // kotiverkossa
  apiUrl = "http://192.168.XXX.XXX:3000/";
} else {
  // Tailnetissa / muu verkko
  apiUrl = "http://TAILNET-ADDRESS:3000/";
}

const config = { apiUrl };
export default config;
