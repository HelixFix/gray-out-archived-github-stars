function applyGrayToArchivedRepos() {
    let archivedRepos = document.querySelectorAll("ul[data-filterable-for='your-repos-filter'] li.archived");
    for (const element of archivedRepos) {
      let repoName = element.querySelector("h3 a");
      if (repoName) {
        repoName.style.color = "gray";
      }
    }
  }
  
  applyGrayToArchivedRepos();
  