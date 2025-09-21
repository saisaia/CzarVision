// Open search modal
function openSearchModal() {
  document.getElementById("searchModal").style.display = "block";
  document.getElementById("modalSearchInput").focus();
}

// Close search modal
function closeSearchModal() {
  document.getElementById("searchModal").style.display = "none";
}

// Perform search (dummy demo)
function performSearch() {
  const query = document.getElementById("modalSearchInput").value;
  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = `<p>Searching for: <strong>${query}</strong></p>`;
}

// Close modal if clicked outside
window.onclick = function(event) {
  const modal = document.getElementById("searchModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
