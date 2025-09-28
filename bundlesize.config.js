module.exports = [
  {
    path: ".next/static/chunks/pages/_app-*.js",
    maxSize: "100 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/pages/_error-*.js",
    maxSize: "50 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/pages/shop-*.js",
    maxSize: "200 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/pages/checkout-*.js",
    maxSize: "150 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/pages/account-*.js",
    maxSize: "100 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/framework-*.js",
    maxSize: "100 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/main-*.js",
    maxSize: "150 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/webpack-*.js",
    maxSize: "50 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/supabase-*.js",
    maxSize: "100 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/stripe-*.js",
    maxSize: "80 kB",
    compression: "gzip",
  },
  {
    path: ".next/static/chunks/vendors-*.js",
    maxSize: "300 kB",
    compression: "gzip",
  },
];
