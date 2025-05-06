async function includeHTML() {
  // Inject header and footer
  const header = await fetch('/pages/components/header.html');
  const headerText = await header.text();
  document.getElementById('header').innerHTML = headerText;

  const footer = await fetch('/pages/components/footer.html');
  const footerText = await footer.text();
  document.getElementById('footer').innerHTML = footerText;
}

includeHTML().then(() => {
  console.log('Loader, Header and Footer Loaded ✅');
  import('/pages/navbar.js');

  import('../../auth.js').then(module => {
    module.requireLogin();
  });
});
