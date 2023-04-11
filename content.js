// fonction principale qui effectue le traitement sur les dépôts archivés.
async function applyWarningToArchivedRepos() {
    let cache        = getRepoCache();
    let starredRepos = getStarredRepos();
  for (const element of starredRepos) {
    let repoName = getRepoName(element);
    if (repoName) {
      let repoUrl = repoName.href;

      if (isRepoArchived(repoUrl, cache)) {
        applyWarningToRepoBlock(repoName)
      } else {
        try {
          const response = await fetch(repoUrl);
          const html = await response.text();

          let isArchived = checkIfRepoArchived(html);

          if (isArchived) {
            applyWarningToRepoBlock(repoName)
          }

          updateRepoCache(repoUrl, isArchived, cache);
        } catch (error) {}
      }
    }
  }
}

function applyWarningToRepoBlock(repoName) {
  const parentDiv = repoName.closest('.col-12.d-block.width-full.py-4.border-bottom.color-border-muted');
  if (parentDiv) {
    parentDiv.classList.add('flash-warn');
  }
}

// fonction qui retourne le cache des dépôts.
function getRepoCache() {
  return JSON.parse(localStorage.getItem("repoCache")) || {};
}

// fonction qui retourne les éléments HTML des dépôts étoilés.
function getStarredRepos() {
  return document.querySelectorAll(
    "div.col-12.d-block.width-full.py-4.border-bottom.color-border-muted"
  );
}

function getRepoName(element) {
  return element.querySelector("h3 a");
}

function isRepoArchived(repoUrl, cache) {
  return (
    cache[repoUrl] &&
    new Date() - new Date(cache[repoUrl].lastChecked) <
      7 * 24 * 60 * 60 * 1000 &&
    cache[repoUrl].archived
  );
}

function checkIfRepoArchived(html) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(html, "text/html");
  let flashWarn = doc.querySelector(
    "div.flash.flash-warn.flash-full.border-top-0.text-center.text-bold.py-2"
  );
  return !!flashWarn;
}

// fonction qui met à jour le cache pour un dépôt donné.
function updateRepoCache(repoUrl, isArchived, cache) {
  cache[repoUrl] = {
    lastChecked: new Date().toISOString(),
    archived: isArchived,
  };
  localStorage.setItem("repoCache", JSON.stringify(cache));
}

let isFunctionActivated = 0;
let timerId;

// /Lorsque la fonction applyWarningToArchivedRepos () est exécutée, la variable isFunctionActivated doit s'incrémenter de 1
function checkFunctionActivation() {
  if (isFunctionActivated < 2) {
    if (window.location.search.includes("tab=stars")) {
      applyWarningToArchivedRepos();
      isFunctionActivated++;
      console.log("isFunctionActivated = ", isFunctionActivated);
    }
  } else {
    clearInterval(timerId);
  }
}

// Lorsque l'utilisateur clique, isFunctionActivated est remis à 0 et la fonction est appelée avec setInterval pour recommencer le processus.
window.addEventListener("click", () => {
  isFunctionActivated = 0;
  timerId = setInterval(checkFunctionActivation, 2000);
});

timerId = setInterval(checkFunctionActivation, 2000);
