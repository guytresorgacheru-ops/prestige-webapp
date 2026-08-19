const AuthModule = {
  populateSchoolOptions(selectEl) {
    if (!selectEl) return;
    APP_CONFIG.schools.forEach(school => {
      const option = document.createElement("option");
      option.value = school;
      option.textContent = school;
      selectEl.appendChild(option);
    });
  },

  validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  },

  validatePassword(password) {
    return password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password);
  },

  handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const studentId = document.getElementById("studentId").value.trim();
    const school = document.getElementById("school").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !studentId || !school || !email || !password || !confirmPassword) {
      return alert("Please complete all fields.");
    }
    if (!this.validateEmail(email)) return alert("Enter a valid email.");
    if (!this.validatePassword(password)) {
      return alert("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
    }
    if (password !== confirmPassword) return alert("Passwords do not match.");
    if (StorageModule.getUserByEmail(email)) return alert("An account with this email already exists.");

    const user = {
      id: uid("user"),
      name,
      studentId,
      school,
      email,
      password,
      itemsPosted: 0,
      itemsClaimed: 0,
      itemsReturned: 0,
    };

    StorageModule.addUser(user);
    alert("Registration successful. Please log in.");
    window.location.href = "login.html";
  },

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const school = document.getElementById("school").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    const user = StorageModule.getUserByEmail(email);
    if (!user) return alert("User not found.");
    if (user.password !== password) return alert("Incorrect password.");
    if (user.school !== school) return alert("Please select the correct school.");

    StorageModule.setCurrentUser(user);
    if (rememberMe) localStorage.setItem("clf_remember_email", email);
    else localStorage.removeItem("clf_remember_email");

    window.location.href = " dashboard.html";
  },

  loadRememberedEmail() {
    const remembered = localStorage.getItem("clf_remember_email");
    if (remembered) {
      const email = document.getElementById("email");
      const rememberMe = document.getElementById("rememberMe");
      if (email) email.value = remembered;
      if (rememberMe) rememberMe.checked = true;
    }
  },

  requireAuth() {
    const user = StorageModule.getCurrentUser();
    if (!user) window.location.href = "login.html";
    return user;
  },

  logout() {
    StorageModule.clearCurrentUser();
    window.location.href = "login.html";
  }
};