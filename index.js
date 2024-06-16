// const promptInput = document.getElementById("promptInput");
const fromRadios = document.getElementsByName("from");
let openSelected = false; // Monitor is the open input is selected

// Checks for Updating Placeholder on Input Prompt Accordingly
fromRadios.forEach(function (radio) {
  radio.addEventListener("change", function () {
    if (radio.checked && radio.value === "Context") {
      // Checks in order to update placeholder accordingly
      promptInput.setAttribute(
        "placeholder",
        "Please Enter Context for Generating Your Questions"
      );
    } else {
      promptInput.setAttribute(
        "placeholder",
        "Please Enter the Topic You Want to Generate Questions On."
      );
    }
  });
});





function hideSelections(/* Hides "Question Type" & "Number of Choices" when "Open" Input is clicked */) {

  const openInputRad = document.getElementById("open"); // Get the radio of the open input section
  const questionsRad = document.getElementById("questions"); // Get the radio of the questions input section
  const quizRad = document.getElementById("quiz"); // Gets the radio of the quiz input section
  const clearRestoreAll = document.querySelectorAll(".clearRestore"); // Get Divs to be cleared

  if (this.checked = true /* If Open Input is checked */) {
    openSelected = true;
    clearRestoreAll.forEach(function (clearRestore) { //Select the "Question Type" & "Number of Choices" so we can hide them
      clearRestore.classList.add("hidden");
    });
  }
  }


function showSelections() {
  if (this.checked) {
    openSelected = false; // Before submitting, we check if openSelected is true. If true, deselect as needed.
    const clearRestoreAll = document.querySelectorAll(".clearRestore");
    clearRestoreAll.forEach(function (clearRestore) { //Select the "Question Type" & "Number of Choices" so we can hide them
      clearRestore.classList.remove("hidden");

    })

  }
}

    

// Submitting the Form to Backend
async function runChecks(form) {
  event.preventDefault();

  // prevent submitting 'Question Type' and 'Number of Choices' when open is selected
  if (openSelected === true){
    const clearRestoreAll = document.querySelectorAll(".clearRestore");
    clearRestoreAll.forEach(function (clearRestore) { //Select the "Question Type" & "Number of Choices" so we can hide them

      // Run another for loop to uncheck their radio
      const radioElements = clearRestore.querySelectorAll('input[type="radio"]');
      radioElements.forEach(function (radioElement) {
        radioElement.checked = false;
      })

    });
    
  }


  const formObj = form.elements; // Getting the form data as an object
  const { prompt, type, from, question_type, no_of_choices, no_of_questions, include_explanation, difficulty } = formObj; // Destructuring the form Object and adding defaults

  if (prompt.value === "" || type.value === "" || from.value === "" || no_of_questions === "" || include_explanation === "" || difficulty === "") {
    console.warn("Complete All Fields Displayed");
    alert("Complete All Fields Displayed");

  } else {
    console.log("starting...")
    try {
      await fetch('http://127.0.0.1:5500/testa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObj)
      })
        .then(response => {
          // Handle the server's response (e.g., parse JSON)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
          }
          return response.json(); // Assuming the server returns JSON
        })
        .then(data => {
          // Update your UI or perform actions based on the response data
          console.log('Success:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });

    } catch (error){
      console.log("error from covering catch block:", error)
    }
}}




// const promptInput = form.elements.Prompt.value;
// const types =  form.elements.Type.value;
// const qTypes = document.getElementsByName("Question_Type");
// const nQuestions = document.getElementsByName("No._of_Options");
// const addExplanations = document.getElementsByName("Include_Explanation");
// const difficulty = document.getElementsByName("Difficulty");



// Test
// function printValues(form) {
//   const formData = {};

//   // Iterate over all form elements (inputs, textareas, selects, etc.)
//   for (let i = 0; i < form.elements.length; i++) {
//     const element = form.elements[i];

//     // Only process named elements that are not buttons
//     if (
//       element.name &&
//       element.type !== "button" &&
//       element.type !== "submit"
//     ) {
//       // Handle radio buttons and checkboxes:
//       if (element.type === "radio" || element.type === "checkbox") {
//         if (element.checked) {
//           formData[element.name] = element.value;
//         }
//       } else {
//         // For other input types (text, textarea, etc.)
//         formData[element.name] = element.value;
//       }
//     }
//   }


// For Best Results, indicate the subject you want to generate questions on. E.g; 'Generate questions on Genetics of human leukocytes antigens regions or major histocompatibility complex. The topic is based on Basic Genetics for Medical Students'
