function navigateToUnit(unit) {
    const unitPages = {
      1: 'unit1.html',
      2: "unit2.html",
      3: "unit3.html",
      4: "unit4.html",
      5: "unit5.html",
    };
  
    if (unitPages[unit]) {
      window.location.href = unitPages[unit];
    } else {
      alert("Page not available!");
    }
  }
  
  function navigateToLogin() {
    window.location.href = "login.html";
  }
  