const canvas = document.getElementById('pdf-canvas');
const fileInput = document.querySelector('#file-input');
const prevPage = document.querySelector('#prev-page');
const nextPage = document.querySelector('#next-page');
const main = document.querySelector('#main');
const header = document.querySelector('#header');
const hiddenHeader = document.querySelector('#hidden-header');
const zoomOut = document.querySelector('#zoom-out');
const zoomDisplay = document.querySelector('#zoom-display');
const zoomIn = document.querySelector('#zoom-in');
const alertMsg = document.querySelector('#alert-msg');

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let pdfDoc = null ;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let ctx = canvas.getContext('2d');

let zoom = 90;

document.addEventListener("keydown", (e) => {
    if (e.key === 'ArrowUp') {
        zoom += 5;
        printAlert(`${zoom}%`);
    } 

    if (e.key === 'ArrowDown')  {
        zoom -= 5;
        printAlert(`${zoom}%`);
    }

    main.style.height = `${zoom}%`;
    zoomDisplay.innerHTML = `${zoom}%`;
});

zoomIn.addEventListener('click', () => {
    zoom += 5;
    main.style.height = `${zoom}%`;
    zoomDisplay.innerHTML = `${zoom}%`;
});

zoomOut.addEventListener('click', () => {
    zoom -= 5;
    main.style.height = `${zoom}%`;
    zoomDisplay.innerHTML = `${zoom}%`;
});

let currentAngle = false;
let headerIsHidden = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'h') {
        if (headerIsHidden) {
            headerIsHidden = false;
            hiddenHeader.style.position = 'absolute';
            header.style.display = 'flex';
            printAlert('Showing menu');
            currentAngle += 180;
            hiddenHeader.style.transform = `rotate(${currentAngle}deg)`;
            return;
        }

        if (!headerIsHidden) {
            headerIsHidden = true;
            hiddenHeader.style.position = 'fixed';
            header.style.display = 'none';
            printAlert('hiding menu');
            currentAngle += 180;
            hiddenHeader.style.transform = `rotate(${currentAngle}deg)`;
            return;
        }
    }
});

hiddenHeader.addEventListener('click', () => {
    currentAngle += 180;
	hiddenHeader.style.transform = `rotate(${currentAngle}deg)`;

    if (headerIsHidden) {
        headerIsHidden = false;
        hiddenHeader.style.position = 'absolute';
        header.style.display = 'flex';
        return;
    }

    if (!headerIsHidden) {
        headerIsHidden = true;
        hiddenHeader.style.position = 'fixed';
        header.style.display = 'none';
        return;
    }
});

function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: ctx, viewport: viewport };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('page-num').textContent = num;
}

function loadPDF(pdfData) {
    const loadingTask = pdfjsLib.getDocument({data: pdfData});
    loadingTask.promise.then(function(pdf) {
        pdfDoc = pdf;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    });
}

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    printAlert(file.name)
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const pdfData = new Uint8Array(e.target.result);
            loadPDF(pdfData);
        };
        reader.readAsArrayBuffer(file);
    } else alert('Por favor, selecione um arquivo PDF');
});

document.addEventListener("keydown", (e) => {
    if (e.key === 'ArrowLeft') {
        if (pageNum <= 1) return;
        pageNum--;
        renderPage(pageNum);
    }

    if (e.key === 'ArrowRight') {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        renderPage(pageNum);
    }
});

prevPage.addEventListener('click', function() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
});


nextPage.addEventListener('click', function() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
});

function printAlert(msg) {
    alertMsg.style.display = 'block'
    alertMsg.textContent = msg;
    
    setTimeout(() => {
        alertMsg.style.display = 'none';
    }, 3000);
}
