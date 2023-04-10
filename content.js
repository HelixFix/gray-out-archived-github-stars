/**
 * The function applies a gray color to the name of archived repositories in a list of starred
 * repositories on a webpage.
 */
async function applyGrayToArchivedRepos() {
    console.log("Starting applyGrayToArchivedRepos...");

    let starredRepos = document.querySelectorAll("div.col-12.d-block.width-full.py-4.border-bottom.color-border-muted");

    console.log("Number of starred repos found:", starredRepos.length);

   /* The `for...of` loop is iterating over a list of starred repositories on a webpage. For each
   repository, it is finding the repository name and URL, fetching the HTML content of the
   repository page using the `fetch()` function, parsing the HTML content using the `DOMParser()`
   function, and checking if the repository is archived by looking for a specific HTML element on
   the page. If the repository is archived, it is applying a gray color to the repository name on
   the original webpage. If there is an error while fetching the repository page, it is logging an
   error message to the console. */
    for (const element of starredRepos) {
        let repoName = element.querySelector("h3 a");
        if (repoName) {
            let repoUrl = repoName.href;
            console.log("Fetching repo:", repoUrl);
            try {
                const response = await fetch(repoUrl);
                const html = await response.text();
                console.log("Repo fetched:", repoUrl);
                let parser = new DOMParser();
                let doc = parser.parseFromString(html, "text/html");
                let flashWarn = doc.querySelector("div.flash.flash-warn.flash-full.border-top-0.text-center.text-bold.py-2");
                if (flashWarn) {
                    console.log("Repo is archived:", repoUrl);
                    repoName.style.color = "gray";
                } else {
                    console.log("Repo is active:", repoUrl);
                }
            } catch (error) {
                console.error(`Error while fetching repo ${repoUrl}`, error);
            }
        }
    }
    console.log("Finished applyGrayToArchivedRepos.");
}

applyGrayToArchivedRepos();
