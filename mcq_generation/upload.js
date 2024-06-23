const fileInput = document.getElementById('file-input');
const fileCount = document.querySelector('.file-count');

fileInput.addEventListener('change', function() {
  const selectedFiles = fileInput.files;
  fileCount.textContent = `${selectedFiles.length} file selected`;

  // Do something with the selected files, e.g., display their names:
  const fileList = [];
  for (let i = 0; i < selectedFiles.length; i++) {
    fileList.push(selectedFiles[i].name);
  }
  console.log(fileList); 
});


