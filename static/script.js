function analyzeSentiment() {
    let text = document.getElementById("text-input").value;
    // if (!text) {
    //     alert("Please enter some text.");
    //     return;
    // }

    if (!text) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Input!',
            text: 'Please enter some text before analyzing.',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    fetch("/analyze", {
        method: "POST",
        body: new URLSearchParams({ "text": text }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
    .then(response => response.json())
    .then(data => {displayResults(data);
        Swal.fire({
            icon: 'success',
            title: 'Analysis Complete!',
            text: 'Your text has been analyzed successfully.',
            confirmButtonColor: '#28a745'
        });
    })
    // .then(data => displayResults(data))

    .catch(error => console.error("Error:", error));
}

let lastCSVResults = null;
let currentPage = 1;
const resultsPerPage = 10;

function bulkAnalyze() {
    let fileInput = document.getElementById("csv-file").files[0];
    if (!fileInput) {
        Swal.fire({
            icon: 'warning',
            title: 'No File Selected!',
            text: 'Please select a CSV file before uploading.',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    if (!fileInput.name.endsWith('.csv')) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid File Format!',
            text: 'Only .csv files are allowed.',
            confirmButtonColor: '#dc3545'
        });
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput);

    fetch("/bulk-analyze", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        lastCSVResults = data;
        displayOverallOnly(data);
        document.getElementById("showSentencesBtn").classList.remove("d-none");
        document.getElementById("hideSentencesBtn").classList.add("d-none");
        Swal.fire({
            icon: 'success',
            title: 'CSV Analyzed!',
            text: 'Your file has been analyzed! Click "Show Sentiment Sentences" to view details.',
            confirmButtonColor: '#28a745'
        });
    })
    .catch(error => console.error("Error:", error));
}

function displayOverallOnly(data) {
    let resultsDiv = document.getElementById("results");
    let paginationDiv = document.getElementById("pagination-controls");
    resultsDiv.innerHTML = `
        <div class="mt-4">
            <strong>Sentiment Percentages:</strong>
            <p>Positive: ${data.percentages.positive}% | Neutral: ${data.percentages.neutral}% | Negative: ${data.percentages.negative}%</p>
        </div>
    `;
    paginationDiv.innerHTML = '';
    updateChart(data.summary);
}

function renderPage(page) {
    const resultsDiv = document.getElementById("results");
    const paginationDiv = document.getElementById("pagination-controls");
    resultsDiv.innerHTML = "";
    paginationDiv.innerHTML = "";

    if (!lastCSVResults) return;

    let allSentences = [];
    for (const sentiment in lastCSVResults.grouped_results) {
        lastCSVResults.grouped_results[sentiment].forEach(sentence => {
            allSentences.push({ sentiment, sentence });
        });
    }

    let totalPages = Math.ceil(allSentences.length / resultsPerPage);
    let start = (page - 1) * resultsPerPage;
    let end = start + resultsPerPage;

    allSentences.slice(start, end).forEach(item => {
        let div = document.createElement("div");
        div.className = "alert alert-secondary mt-2";
        div.innerHTML = `<strong>${item.sentiment}:</strong> <br> ${item.sentence}`;
        resultsDiv.appendChild(div);
    });

    // Pagination buttons
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            let btn = document.createElement("button");
            btn.textContent = i;
            btn.className = `btn ${i === page ? 'btn-primary' : 'btn-outline-primary'} mx-1`;
            btn.onclick = () => {
                currentPage = i;
                renderPage(i);
            };
            paginationDiv.appendChild(btn);
        }
    }
}

// Show / Hide Events
document.getElementById("showSentencesBtn").addEventListener("click", function() {
    currentPage = 1;
    renderPage(currentPage);
    this.classList.add("d-none");
    document.getElementById("hideSentencesBtn").classList.remove("d-none");
});

document.getElementById("hideSentencesBtn").addEventListener("click", function() {
    displayOverallOnly(lastCSVResults);
    this.classList.add("d-none");
    document.getElementById("showSentencesBtn").classList.remove("d-none");
});


// let lastCSVResults = null;

// function bulkAnalyze() {
//     let fileInput = document.getElementById("csv-file").files[0];
//     if (!fileInput) {
//         Swal.fire({
//             icon: 'warning',
//             title: 'No File Selected!',
//             text: 'Please select a CSV file before uploading.',
//             confirmButtonColor: '#ffc107'
//         });
//         return;
//     }

//     if (!fileInput.name.endsWith('.csv')) {
//         Swal.fire({
//             icon: 'error',
//             title: 'Invalid File Format!',
//             text: 'Only .csv files are allowed.',
//             confirmButtonColor: '#dc3545'
//         });
//         return;
//     }

//     let formData = new FormData();
//     formData.append("file", fileInput);

//     fetch("/bulk-analyze", {
//         method: "POST",
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         lastCSVResults = data;
//         displayOverallOnly(data);
//         document.getElementById("showSentencesBtn").classList.remove("d-none");
//         Swal.fire({
//             icon: 'success',
//             title: 'CSV Analyzed!',
//             text: 'File analyzed! Click "Show Sentiment Sentences" to view details.',
//             confirmButtonColor: '#28a745'
//         });
//     })
//     .catch(error => {
//         console.error("Error:", error);
//     });
// }

// function displayOverallOnly(data) {
//     let resultsDiv = document.getElementById("results");
//     resultsDiv.innerHTML = `
//         <div class="mt-4">
//             <strong>Sentiment Percentages:</strong>
//             <p>Positive: ${data.percentages.positive}% | Neutral: ${data.percentages.neutral}% | Negative: ${data.percentages.negative}%</p>
//         </div>
//     `;
//     updateChart(data.summary);
// }

// function displayDetailedSentences(data) {
//     let resultsDiv = document.getElementById("results");
//     for (const sentiment in data.grouped_results) {
//         if (data.grouped_results[sentiment].length > 0) {
//             let div = document.createElement("div");
//             div.className = "alert alert-secondary mt-2";
//             div.innerHTML = `<strong>${sentiment}:</strong> <br> ${data.grouped_results[sentiment].join("<br>")}`;
//             resultsDiv.appendChild(div);
//         }
//     }
// }

// document.getElementById("showSentencesBtn").addEventListener("click", function() {
//     if (lastCSVResults) {
//         displayDetailedSentences(lastCSVResults);
//         this.classList.add("d-none");
//     }
// });

function displayResults(data) {
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    // Display grouped results
    for (const sentiment in data.grouped_results) {
        if (data.grouped_results[sentiment].length > 0) {
            let div = document.createElement("div");
            div.className = "alert alert-secondary mt-2";
            div.innerHTML = `<strong>${sentiment}:</strong> <br> ${data.grouped_results[sentiment].join("<br>")}`;
            resultsDiv.appendChild(div);
        }
    }

    // Display percentages and overall sentiment
    resultsDiv.innerHTML += `
        <div class="mt-4">
            <strong>Sentiment Percentages:</strong>
            <p>Positive: ${data.percentages.positive}% | Neutral: ${data.percentages.neutral}% | Negative: ${data.percentages.negative}%</p>
        </div>
    `;

    updateChart(data.summary);
}


// Chart for Sentiment Summary
function updateChart(summary) {
    let ctx = document.getElementById("sentimentChart").getContext("2d");

    // Destroy previous chart if exists
    if (window.sentimentChart instanceof Chart) {
        window.sentimentChart.destroy();
    }

    window.sentimentChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Positive", "Neutral", "Negative"],
            datasets: [{
                data: [summary.positive, summary.neutral, summary.negative],
                backgroundColor: ["#28a745", "#ffc107", "#dc3545"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Determine Overall Sentiment
    let overallSentiment = "Neutral 😐";
    let progressBarColor = "#ffc107"; // Yellow for neutral
    let progressBarWidth = "50%"; // Default width for neutral

    if (summary.positive > summary.negative) {
        overallSentiment = "Good 😊";
        progressBarColor = "green";
        progressBarWidth = "80%";
    } 
    if (summary.negative > summary.positive) {
        overallSentiment = "Bad 😞";
        progressBarColor = "red";
        progressBarWidth = "80%";
    }

    // Update Sentiment Text
    document.getElementById("overall-sentiment").innerText = `Overall Sentiment: ${overallSentiment}`;

    // Show Progress Bar Only After Analysis
    let progressBarContainer = document.getElementById("sentiment-progress-container");
    progressBarContainer.style.display = "block"; // Show the progress bar

    // Update Progress Bar
    let progressBar = document.getElementById("sentiment-progress-bar");
    progressBar.style.width = progressBarWidth;
    progressBar.style.backgroundColor = progressBarColor;
}

// async function downloadResultsAsPDF() {
//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF();
//     let y = 20;

//     if (!lastCSVResults) {
//         Swal.fire({
//             icon: 'warning',
//             title: 'No Results Found!',
//             text: 'Please analyze text or upload a CSV before downloading.',
//             confirmButtonText: 'OK',
//             customClass: { confirmButton: 'btn btn-warning' },
//             buttonsStyling: false
//         });
//         return;
//     }

//     pdf.setFontSize(16);
//     pdf.text("Sentiment Analysis Report", 15, y);
//     y += 10;

//     pdf.setFontSize(12);
//     pdf.text(`Positive: ${lastCSVResults.percentages.positive}%`, 15, y += 10);
//     pdf.text(`Neutral: ${lastCSVResults.percentages.neutral}%`, 15, y += 10);
//     pdf.text(`Negative: ${lastCSVResults.percentages.negative}%`, 15, y += 10);

//     y += 15;
//     pdf.setFontSize(14);
//     pdf.text("Detailed Sentiment Sentences:", 15, y);
//     y += 10;
//     pdf.setFontSize(11);

//     for (const sentiment in lastCSVResults.grouped_results) {
//         pdf.text(`${sentiment}:`, 15, y);
//         y += 8;

//         lastCSVResults.grouped_results[sentiment].forEach(sentence => {
//             const splitText = pdf.splitTextToSize("- " + sentence, 180);
//             splitText.forEach(line => {
//                 if (y > 280) {
//                     pdf.addPage();
//                     y = 20;
//                 }
//                 pdf.text(line, 20, y);
//                 y += 6;
//             });
//         });

//         y += 5;
//     }

//     pdf.save('Sentiment-Analysis-Report.pdf');

//     Swal.fire({
//         icon: "success",
//         title: "Download Complete!",
//         text: "Your Sentiment Analysis Report is saved as PDF.",
//         confirmButtonText: "Done",
//         customClass: { confirmButton: 'btn btn-success' },
//         buttonsStyling: false
//     });
// }

async function downloadResultsAsPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    let y = 20;

    if (!lastCSVResults) {
        Swal.fire({
            icon: 'warning',
            title: 'No Results Found!',
            text: 'Please analyze text or upload a CSV before downloading.',
            confirmButtonText: 'OK',
            customClass: { confirmButton: 'btn btn-warning' },
            buttonsStyling: false
        });
        return;
    }

    const now = new Date().toLocaleString();

    // Fancy Header
    pdf.setFontSize(20);
    pdf.setTextColor(41, 128, 185); // Blue tone
    pdf.text("💡 Sentiment Analysis Report", 15, y);

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Generated on: ${now}`, 15, y += 10);
    pdf.line(15, y += 5, 195, y);

    // Summary Block
    pdf.setFontSize(14);
    pdf.setTextColor(52, 73, 94);
    pdf.text("📊 Summary Overview:", 15, y += 10);

    pdf.setFontSize(12);
    pdf.setTextColor(39, 174, 96);
    pdf.text(`✔ Positive: ${lastCSVResults.percentages.positive}%`, 15, y += 10);

    pdf.setTextColor(127, 140, 141);
    pdf.text(`✔ Neutral : ${lastCSVResults.percentages.neutral}%`, 15, y += 8);

    pdf.setTextColor(231, 76, 60);
    pdf.text(`✔ Negative: ${lastCSVResults.percentages.negative}%`, 15, y += 8);

    // Overall Sentiment
    pdf.setTextColor(41, 128, 185);
    pdf.line(15, y += 5, 195, y);
    pdf.setFontSize(14);
    pdf.text(`🧠 Overall Sentiment: ${lastCSVResults.overall}`, 15, y += 10);
    pdf.line(15, y += 5, 195, y);

    // New Page for Sentences
    pdf.addPage();
    y = 20;

    pdf.setFontSize(16);
    pdf.setTextColor(52, 152, 219);
    pdf.text("💬 Sentiment-wise Sentences:", 15, y);

    y += 10;

    for (const sentiment in lastCSVResults.grouped_results) {
        const emojiMap = {
            "Positive": "😊",
            "Negative": "😞",
            "Neutral": "😐",
            "Strongly Positive": "😃",
            "Strongly Negative": "😡",
            "Weakly Positive": "🙂",
            "Weakly Negative": "🙁"
        };

        const emoji = emojiMap[sentiment] || "";

        if (lastCSVResults.grouped_results[sentiment].length > 0) {
            pdf.setFontSize(13);
            pdf.setTextColor(142, 68, 173);
            pdf.text(`${emoji} ${sentiment}`, 15, y);
            y += 8;

            pdf.setFontSize(11);
            pdf.setTextColor(44, 62, 80);
            lastCSVResults.grouped_results[sentiment].forEach(sentence => {
                const wrappedText = pdf.splitTextToSize(`- ${sentence}`, 180);
                wrappedText.forEach(line => {
                    if (y > 280) {
                        pdf.addPage();
                        y = 20;
                    }
                    pdf.text(line, 20, y);
                    y += 6;
                });
            });

            y += 10;
        }
    }

    pdf.save('Professional-Sentiment-Analysis-Report.pdf');

    Swal.fire({
        icon: "success",
        title: "Report Downloaded!",
        text: "Your stylish PDF report is ready.",
        confirmButtonText: "Done",
        customClass: { confirmButton: 'btn btn-success' },
        buttonsStyling: false
    });
}


// async function downloadResultsAsPDF() {
//     const resultsDiv = document.getElementById("results");

//     if (!resultsDiv || resultsDiv.innerText.trim() === "") {
//         Swal.fire({
//             icon: 'warning',
//             title: 'No Results Found!',
//             text: 'Please perform sentiment analysis before downloading.',
//             confirmButtonText: 'OK',
//             customClass: { confirmButton: 'btn btn-warning' },
//             buttonsStyling: false
//         });
//         return;
//     }

//     try {
//         const canvas = await html2canvas(resultsDiv, { scale: 2, useCORS: true });
//         const imgData = canvas.toDataURL('image/jpeg', 1.0);

//         const { jsPDF } = window.jspdf;
//         const pdf = new jsPDF({
//             orientation: 'portrait',
//             unit: 'px',
//             format: [canvas.width, canvas.height]
//         });

//         pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
//         pdf.save('Sentiment-Analysis-Report.pdf');

//         Swal.fire({
//             icon: "success",
//             title: "Download Complete!",
//             text: "Your Sentiment Analysis Report is saved.",
//             confirmButtonText: "Done",
//             customClass: { confirmButton: 'btn btn-success' },
//             buttonsStyling: false
//         });

//     } catch (error) {
//         console.error("PDF Generation Error:", error);
//         Swal.fire({
//             icon: "error",
//             title: "Download Failed!",
//             text: "There was an issue generating the PDF.",
//             confirmButtonText: "OK",
//             customClass: { confirmButton: 'btn btn-danger' },
//             buttonsStyling: false
//         });
//     }
// }



