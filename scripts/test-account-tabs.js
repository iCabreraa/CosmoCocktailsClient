// Test script to verify account tab functionality
// Run this in the browser console on the account page

console.log("Testing account tab functionality...");

// Test 1: Check if URL parameters are working
const urlParams = new URLSearchParams(window.location.search);
const currentTab = urlParams.get("tab");
console.log("Current tab from URL:", currentTab);

// Test 2: Simulate clicking the orders tab
const ordersTab =
  document.querySelector('[data-tab="orders"]') ||
  document.querySelector('button[onclick*="orders"]') ||
  Array.from(document.querySelectorAll("button")).find(btn =>
    btn.textContent?.includes("Pedidos")
  );

if (ordersTab) {
  console.log("Found orders tab button:", ordersTab);
  ordersTab.click();
  setTimeout(() => {
    console.log("URL after clicking orders:", window.location.href);
  }, 100);
} else {
  console.log("Orders tab button not found");
}

// Test 3: Check if the tab content is loading
setTimeout(() => {
  const ordersContent =
    document.querySelector('[data-testid="orders-content"]') ||
    document.querySelector("h2")?.textContent?.includes("Pedidos");
  console.log("Orders content loaded:", !!ordersContent);
}, 500);

