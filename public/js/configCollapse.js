function enableConfigCollapse(container) {

  const cards = container.querySelectorAll(".config-card");

  cards.forEach(card => {

    const title = card.querySelector(".config-title");
    if (!title) return;

    const body = document.createElement("div");
    body.className = "config-body";

    while (title.nextSibling) {
      body.appendChild(title.nextSibling);
    }

    card.appendChild(body);

    let collapsed = false;

    title.style.cursor = "pointer";

    title.addEventListener("click", () => {

      collapsed = !collapsed;

      body.style.display = collapsed ? "none" : "block";

      title.classList.toggle("collapsed", collapsed);

    });

  });

}