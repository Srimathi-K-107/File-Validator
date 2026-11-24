let form = document.getElementById("form");
let file = document.getElementById("file");
let txt = document.getElementById("txt");
let results = document.getElementById("results");
let preview = document.getElementById("preview");

let totalcount = document.getElementById("totalcount");
let validfilescount = document.getElementById("validfilescount");
let invalidfilescount = document.getElementById("invalidfilescount");
let totalsizecount = document.getElementById("totalsizecount");

let clear = document.getElementById("clear");
let dragdropdiv = document.getElementById("dragdropdiv");

let stats = document.getElementById("stats");
let resultsSection = document.getElementById("results-section");
let previewSection = document.getElementById("preview-section");

let data = [];
let totalsize = 0;

let typearr = ["image/png", "image/jpeg"];

// Open file picker when clicking the upload area.
dragdropdiv.addEventListener("click", (e) => {
  if (e.target.closest(".choose-btn")) {
    return;
  }

  if (e.target !== file) {
    file.click();
  }
});

// Update selected files.
file.addEventListener("change", () => {
  data = Array.from(file.files);
  txt.textContent = "";
});

// Drag and drop effects.
dragdropdiv.addEventListener("dragover", (e) => {
  e.preventDefault();
  dragdropdiv.classList.add("dragging");
});

dragdropdiv.addEventListener("dragleave", (e) => {
  if (!dragdropdiv.contains(e.relatedTarget)) {
    dragdropdiv.classList.remove("dragging");
  }
});

dragdropdiv.addEventListener("drop", (e) => {
  e.preventDefault();

  dragdropdiv.classList.remove("dragging");

  let droppedFiles = Array.from(e.dataTransfer.files);

  let dt = new DataTransfer();

  droppedFiles.forEach((d) => {
    dt.items.add(d);
  });

  file.files = dt.files;
  data = Array.from(file.files);

  txt.textContent = "";
});

// Validate files on submit.
form.addEventListener("submit", (e) => {
  e.preventDefault();

  data = Array.from(file.files);

  txt.textContent = "";
  results.innerHTML = "";
  preview.innerHTML = "";
  clear.innerHTML = "";

  if (data.length === 0) {
    stats.hidden = true;
    resultsSection.hidden = true;
    previewSection.hidden = true;

    txt.textContent = "❌ Please select a file first.";
    return;
  }

  // Show the four stat boxes only after validation starts.
  stats.hidden = false;
  resultsSection.hidden = false;
  previewSection.hidden = false;

  main(data);
  totalcountfunc();

  let clearall = document.createElement("button");

  clearall.className = "clearall";
  clearall.type = "button";
  clearall.textContent = "Clear All Files";

  clear.append(clearall);

  clearall.addEventListener("click", () => {
    file.value = "";
    data = [];
    totalsize = 0;

    results.innerHTML = "";
    preview.innerHTML = "";
    clear.innerHTML = "";

    totalcount.textContent = "";
    validfilescount.textContent = "";
    invalidfilescount.textContent = "";
    totalsizecount.textContent = "";

    txt.textContent = "";

    // Hide the stats and sections again.
    stats.hidden = true;
    resultsSection.hidden = true;
    previewSection.hidden = true;
  });
});

// Calculate file statistics.
function totalcountfunc() {
  let validfiles = 0;
  let invalidfiles = 0;
  let total = 0;

  data.forEach((d) => {
    let size = d.size / (1024 * 1024);

    total += d.size;

    if (typearr.includes(d.type) && size <= 2) {
      validfiles++;
    } else {
      invalidfiles++;
    }
  });

  totalcount.textContent = data.length;
  validfilescount.textContent = validfiles;
  invalidfilescount.textContent = invalidfiles;

  totalsize = total;

  totalsizecount.textContent = (totalsize / (1024 * 1024)).toFixed(2) + " MB";
}

// Validate type and size, then render results and previews.
function main(files) {
  totalsize = 0;

  files.forEach((d) => {
    let resultBox = document.createElement("div");
    resultBox.className = "resultbox";

    let p1 = document.createElement("p");
    let p2 = document.createElement("p");

    let type = d.type;
    let size = d.size / (1024 * 1024);

    totalsize += d.size;

    let validType = typearr.includes(type);
    let validSize = size <= 2;

    if (validType) {
      p1.textContent = `✅ ${d.name} — valid file type`;
    } else {
      p1.textContent = `❌ ${d.name} — invalid file type`;
    }

    if (validSize) {
      p2.textContent = `✅ File size: ${size.toFixed(2)} MB`;
    } else {
      p2.textContent = `❌ ${d.name} — exceeds the 2 MB limit`;
    }

    resultBox.append(p1, p2);
    results.append(resultBox);

    // Preview only files that pass both checks.
    if (validType && validSize) {
      let div = document.createElement("div");
      div.className = "image-box";

      let divtxt = document.createElement("div");
      divtxt.className = "divtxt";

      let image = document.createElement("img");
      let url = URL.createObjectURL(d);

      image.src = url;
      image.alt = d.name;

      image.addEventListener("load", () => {
        URL.revokeObjectURL(url);
      });

      image.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        image.alt = "Image preview unavailable";
      });

      let fileDetails = document.createElement("div");
      fileDetails.className = "file-details";

      let name = document.createElement("p");
      name.className = "file-name";
      name.textContent = d.name;

      let fileSize = document.createElement("p");
      fileSize.textContent = `File size: ${d.size.toLocaleString()} bytes`;

      let fileType = document.createElement("p");
      fileType.textContent = `Format: ${type}`;

      fileDetails.append(name, fileSize, fileType);
      divtxt.append(image, fileDetails);

      let removebtn = document.createElement("button");
      removebtn.type = "button";
      removebtn.textContent = "Remove";
      removebtn.className = "btnremove";

      removebtn.addEventListener("click", () => {
        data = data.filter((item) => item !== d);

        let dt = new DataTransfer();

        data.forEach((item) => {
          dt.items.add(item);
        });

        file.files = dt.files;

        // Refresh results and statistics after removing a file.
        results.innerHTML = "";
        preview.innerHTML = "";

        main(data);
        totalcountfunc();

        if (data.length === 0) {
          file.value = "";
          clear.innerHTML = "";
          stats.hidden = true;
          resultsSection.hidden = true;
          previewSection.hidden = true;
          txt.textContent = "All files have been removed.";
        }
      });

      div.append(divtxt, removebtn);
      preview.append(div);
    }
  });

  totalcountfunc();
}
