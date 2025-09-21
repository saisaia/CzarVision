// ================= OPEN MODAL =================
function openSearchModal() {
  document.getElementById("searchModal").style.display = "block";
}

// ================= CLOSE MODAL =================
function closeSearchModal() {
  document.getElementById("searchModal").style.display = "none";
}

// ================= CLOSE ON OUTSIDE CLICK =================
window.onclick = function(event) {
  const modal = document.getElementById("searchModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
