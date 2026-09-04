// ============================================================
// PITCH CLUTCH '26
// REGISTRATION + PAYMENT SCREENSHOT
// Google Sign-In removed
// ============================================================


const form = document.getElementById("registerForm");
const formMsg = document.getElementById("formMsg");
const submitBtn = document.getElementById("submitBtn");

const formWrap = document.getElementById("formWrap");
const successBox = document.getElementById("successBox");

const paymentScreenshot =
  document.getElementById("paymentScreenshot");

const fileName =
  document.getElementById("fileName");


const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// ============================================================
// PAYMENT SCREENSHOT
// ============================================================

paymentScreenshot.addEventListener("change", () => {

  const file = paymentScreenshot.files[0];

  if (!file) {

    fileName.textContent = "";

    return;
  }


  if (!ALLOWED_TYPES.includes(file.type)) {

    fileName.textContent =
      "Invalid file type. Please upload JPG, PNG or WEBP.";

    paymentScreenshot.value = "";

    return;
  }


  if (file.size > MAX_FILE_SIZE) {

    fileName.textContent =
      "File is too large. Maximum allowed size is 5 MB.";

    paymentScreenshot.value = "";

    return;
  }


  fileName.textContent =
    `Selected: ${file.name}`;

});


// ============================================================
// COLLEGE SELECTION
// ============================================================

function wireCollegeChoice(prefix) {

  const cepButton =
    document.getElementById(`${prefix}CollegeCep`);

  const otherButton =
    document.getElementById(`${prefix}CollegeOther`);

  const otherWrap =
    document.getElementById(`${prefix}CollegeOtherWrap`);

  const otherInput =
    document.getElementById(`${prefix}CollegeOtherInput`);

  const hiddenValue =
    document.getElementById(`${prefix}CollegeValue`);


  function selectCEP() {

    cepButton.classList.add("active");

    otherButton.classList.remove("active");

    otherWrap.style.display = "none";

    otherInput.required = false;

    hiddenValue.value = "CEP";

  }


  function selectOther() {

    otherButton.classList.add("active");

    cepButton.classList.remove("active");

    otherWrap.style.display = "block";

    otherInput.required = true;

    hiddenValue.value =
      otherInput.value.trim();

  }


  cepButton.addEventListener(
    "click",
    selectCEP
  );


  otherButton.addEventListener(
    "click",
    selectOther
  );


  otherInput.addEventListener(
    "input",
    () => {

      hiddenValue.value =
        otherInput.value.trim();

    }
  );


  selectCEP();
}


wireCollegeChoice("m1");

wireCollegeChoice("m2");


// ============================================================
// PHONE NUMBER
// ============================================================

["m1Phone", "m2Phone"].forEach((id) => {

  const input =
    document.getElementById(id);


  input.addEventListener(
    "input",
    () => {

      input.value =
        input.value
          .replace(/\D/g, "")
          .slice(0, 10);

    }
  );

});


// ============================================================
// VALIDATION
// ============================================================

function setFieldError(field, invalid) {

  if (!field) return;

  field.classList.toggle(
    "invalid",
    invalid
  );

}


function validateEmail(value) {

  return /^[^\s@]+@gmail\.com$/i
    .test(value.trim());

}


function validatePhone(value) {

  return /^[0-9]{10}$/
    .test(value.trim());

}


function validateMember(prefix) {

  let valid = true;


  // NAME

  const name =
    document.getElementById(`${prefix}Name`);

  const nameField =
    document.getElementById(`${prefix}NameField`);


  if (!name.value.trim()) {

    setFieldError(nameField, true);

    valid = false;

  } else {

    setFieldError(nameField, false);

  }


  // EMAIL

  const email =
    document.getElementById(`${prefix}Email`);

  const emailField =
    document.getElementById(`${prefix}EmailField`);


  if (!validateEmail(email.value)) {

    setFieldError(emailField, true);

    valid = false;

  } else {

    setFieldError(emailField, false);

  }


  // PHONE

  const phone =
    document.getElementById(`${prefix}Phone`);

  const phoneField =
    document.getElementById(`${prefix}PhoneField`);


  if (!validatePhone(phone.value)) {

    setFieldError(phoneField, true);

    valid = false;

  } else {

    setFieldError(phoneField, false);

  }


  // DEPARTMENT

  const dept =
    document.getElementById(`${prefix}Dept`);

  const deptField =
    document.getElementById(`${prefix}DeptField`);


  if (!dept.value) {

    setFieldError(deptField, true);

    valid = false;

  } else {

    setFieldError(deptField, false);

  }


  // SEMESTER

  const sem =
    document.getElementById(`${prefix}Sem`);

  const semField =
    document.getElementById(`${prefix}SemField`);


  if (!sem.value) {

    setFieldError(semField, true);

    valid = false;

  } else {

    setFieldError(semField, false);

  }


  // COLLEGE

  const college =
    document.getElementById(
      `${prefix}CollegeValue`
    ).value.trim();


  const collegeField =
    document.getElementById(
      `${prefix}CollegeField`
    );


  if (!college) {

    collegeField.classList.add("invalid");

    valid = false;

  } else {

    collegeField.classList.remove("invalid");

  }


  return valid;

}


// ============================================================
// UPLOAD PAYMENT SCREENSHOT
// ============================================================

async function uploadPaymentScreenshot(file) {

  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const fileName =
    `payment-${Date.now()}-${crypto.randomUUID()}.${extension}`;


  const filePath =
    `registrations/${fileName}`;


  const { error } =
    await supabaseClient
      .storage
      .from("payment-proofs")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        }
      );


  if (error) {

    throw error;

  }


  return filePath;

}


// ============================================================
// FORM SUBMISSION
// ============================================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    formMsg.textContent = "";

    formMsg.className = "form-msg";


    // ========================================================
    // PAYMENT SCREENSHOT VALIDATION
    // ========================================================

    const paymentFile =
      paymentScreenshot.files[0];


    if (!paymentFile) {

      formMsg.textContent =
        "Please upload your payment screenshot.";

      formMsg.classList.add("error");

      return;

    }


    if (!ALLOWED_TYPES.includes(paymentFile.type)) {

      formMsg.textContent =
        "Please upload a JPG, PNG or WEBP image.";

      formMsg.classList.add("error");

      return;

    }


    if (paymentFile.size > MAX_FILE_SIZE) {

      formMsg.textContent =
        "Payment screenshot must be 5 MB or smaller.";

      formMsg.classList.add("error");

      return;

    }


    // ========================================================
    // TEAM VALIDATION
    // ========================================================

    const teamName =
      document.getElementById("teamName");

    const teamNameField =
      document.getElementById("teamNameField");


    if (!teamName.value.trim()) {

      setFieldError(
        teamNameField,
        true
      );

      formMsg.textContent =
        "Please enter your team name.";

      formMsg.classList.add("error");

      return;

    }


    setFieldError(
      teamNameField,
      false
    );


    // ========================================================
    // MEMBER VALIDATION
    // ========================================================

    const member1Valid =
      validateMember("m1");

    const member2Valid =
      validateMember("m2");


    if (!member1Valid || !member2Valid) {

      formMsg.textContent =
        "Please fix the highlighted fields.";

      formMsg.classList.add("error");

      return;

    }


    // ========================================================
    // SUBMITTING
    // ========================================================

    submitBtn.disabled = true;

    submitBtn.textContent =
      "Uploading payment proof...";


    let paymentPath = null;


    try {

      // ======================================================
      // 1. UPLOAD PAYMENT SCREENSHOT
      // ======================================================

      paymentPath =
        await uploadPaymentScreenshot(
          paymentFile
        );


      submitBtn.textContent =
        "Submitting registration...";


      // ======================================================
      // 2. CREATE REGISTRATION DATA
      // ======================================================

      const payload = {

        team_name:
          document
            .getElementById("teamName")
            .value
            .trim(),


        // MEMBER 1

        member1_name:
          document
            .getElementById("m1Name")
            .value
            .trim(),

        member1_email:
          document
            .getElementById("m1Email")
            .value
            .trim(),

        member1_phone:
          document
            .getElementById("m1Phone")
            .value
            .trim(),

        member1_department:
          document
            .getElementById("m1Dept")
            .value,

        member1_semester:
          document
            .getElementById("m1Sem")
            .value,

        member1_college:
          document
            .getElementById("m1CollegeValue")
            .value
            .trim(),


        // MEMBER 2

        member2_name:
          document
            .getElementById("m2Name")
            .value
            .trim(),

        member2_email:
          document
            .getElementById("m2Email")
            .value
            .trim(),

        member2_phone:
          document
            .getElementById("m2Phone")
            .value
            .trim(),

        member2_department:
          document
            .getElementById("m2Dept")
            .value,

        member2_semester:
          document
            .getElementById("m2Sem")
            .value,

        member2_college:
          document
            .getElementById("m2CollegeValue")
            .value
            .trim(),


        // PAYMENT PROOF

        payment_screenshot_path:
          paymentPath

      };


      // ======================================================
      // 3. INSERT INTO SUPABASE
      // ======================================================

      const { error } =
        await supabaseClient
          .from("registrations")
          .insert([payload]);


      if (error) {

        console.error(
          "Registration error:",
          error
        );


        // Delete uploaded screenshot
        // if registration fails

        if (paymentPath) {

          await supabaseClient
            .storage
            .from("payment-proofs")
            .remove([
              paymentPath
            ]);

        }


        if (error.code === "23505") {

          formMsg.textContent =
            "This registration has already been submitted.";

        } else {

          formMsg.textContent =
            "Registration could not be completed. Please try again.";

        }


        formMsg.classList.add("error");


        submitBtn.disabled = false;

        submitBtn.textContent =
          "Submit Registration";


        return;

      }


      // ======================================================
      // 4. SUCCESS
      // ======================================================

      formWrap.style.display =
        "none";


      successBox.style.display =
        "block";


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });


    } catch (error) {

      console.error(
        "Payment upload error:",
        error
      );


      if (paymentPath) {

        await supabaseClient
          .storage
          .from("payment-proofs")
          .remove([
            paymentPath
          ]);

      }


      formMsg.textContent =
        "Unable to upload the payment screenshot. Please try again.";


      formMsg.classList.add("error");


      submitBtn.disabled = false;

      submitBtn.textContent =
        "Submit Registration";

    }

  }
);