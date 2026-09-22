// NAVIGATION: show one section of index.html at a time.

const pages = Array.from(document.querySelectorAll(".page"));
const navigationLinks = document.querySelectorAll("nav a");

function showPage(moveFocus = false) {
  const requestedPage = window.location.hash.slice(1) || "home";

  // Let the skip-to-content link work normally.
  if (requestedPage === "main") {
    return;
  }

  const activePage =
    pages.find((page) => page.id === requestedPage) || pages[0];

  pages.forEach((page) => {
    page.hidden = page !== activePage;
  });

  navigationLinks.forEach((link) => {
    if (link.hash === "#" + activePage.id) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const heading = activePage.querySelector("h1");

  document.title =
    heading.textContent.trim().replace(/\s+/g, " ") +
    " | CS110 Field Guide";

  if (moveFocus) {
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

window.addEventListener("hashchange", () => {
  showPage(true);
});

showPage();


// FEEDBACK BUTTONS: show an explanation after a choice.

document.querySelectorAll("[data-feedback]").forEach((button) => {
  button.addEventListener("click", () => {
    const experiment = button.closest(".experiment");
    const result = experiment.querySelector(".feedback");

    result.textContent = button.dataset.feedback;

    experiment.querySelectorAll("[data-feedback]").forEach((choice) => {
      choice.classList.toggle("selected", choice === button);
    });
  });
});


// WEEK 2: click counter and reset button.

let clickCount = 0;

const helloButton = document.querySelector("#hello-button");
const resetButton = document.querySelector("#reset-button");
const helloResult = document.querySelector("#hello-result");

helloButton.addEventListener("click", () => {
  clickCount += 1;

  helloResult.textContent =
    "Hello, explorer! You made the page respond. Clicks: " +
    clickCount +
    ".";
});

resetButton.addEventListener("click", () => {
  clickCount = 0;
  helloResult.textContent = "Ready for your first click.";
});


// WEEK 4: connect the original 3D project.

const threeLink = document.querySelector("#three-link");
const threeStatus = document.querySelector("#three-status");
const week4Url = window.FIELD_GUIDE?.week4Url?.trim();

if (week4Url) {
  try {
    const destination = new URL(week4Url, window.location.href);

    if (["http:", "https:", "file:"].includes(destination.protocol)) {
      threeLink.href = destination.href;
      threeLink.hidden = false;

      threeStatus.textContent =
        "Explore the original Week 4 3D project using the link below.";
    } else {
      threeStatus.textContent =
        "Check the 3D link in config.js. Use a website URL or local file path.";
    }
  } catch {
    threeStatus.textContent =
      "The 3D link could not be read. Check its spelling in config.js.";
  }
}
   // BABYLON.JS: INTERACTIVE 3D CRYSTAL

(() => {
  const canvas = document.getElementById("crystal-canvas");
  const status = document.getElementById("crystal-status");

  if (!canvas || !status) {
    return;
  }

  if (!window.BABYLON || !BABYLON.Engine.IsSupported()) {
    status.textContent =
      "The 3D scene could not load. Check your internet connection and browser WebGL support.";
    return;
  }

  try {
    // Create the rendering engine and scene.
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    scene.clearColor = new BABYLON.Color4(
      0.04,
      0.1,
      0.14,
      1
    );

    // Create a camera that can orbit around the crystal.
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      6,
      BABYLON.Vector3.Zero(),
      scene
    );

    camera.attachControl(canvas, true);

    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 10;
    camera.lowerBetaLimit = 0.2;
    camera.upperBetaLimit = Math.PI - 0.2;
    camera.panningSensibility = 0;

    // Add lighting.
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );

    light.intensity = 1.2;

    // Create an eight-sided shape and stretch it vertically.
    const crystal = BABYLON.MeshBuilder.CreatePolyhedron(
      "crystal",
      {
        type: 1,
        size: 1.2
      },
      scene
    );

    crystal.scaling.y = 1.5;

    // Give the crystal its starting color.
    const material = new BABYLON.StandardMaterial(
      "crystalMaterial",
      scene
    );

    material.diffuseColor =
      BABYLON.Color3.FromHexString("#50dcca");

    material.emissiveColor =
      material.diffuseColor.scale(0.2);

    crystal.material = material;

    const colors = [
      "#50dcca",
      "#b997ff",
      "#f0cf86",
      "#fc8b9d"
    ];

    let colorIndex = 0;

    // Respect the visitor's reduced-motion preference.
    let spinning = !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const colorButton =
      document.getElementById("crystal-color");

    const spinButton =
      document.getElementById("crystal-spin");

    const resetButton =
      document.getElementById("crystal-reset");

    spinButton.textContent = spinning
      ? "Pause rotation"
      : "Start rotation";

    // Change the crystal's color.
    colorButton.addEventListener("click", () => {
      colorIndex = (colorIndex + 1) % colors.length;

      material.diffuseColor =
        BABYLON.Color3.FromHexString(colors[colorIndex]);

      material.emissiveColor =
        material.diffuseColor.scale(0.2);

      status.textContent =
        "Crystal color changed! JavaScript updated its material.";
    });

    // Start or pause the animation.
    spinButton.addEventListener("click", () => {
      spinning = !spinning;

      spinButton.textContent = spinning
        ? "Pause rotation"
        : "Start rotation";

      status.textContent = spinning
        ? "Rotation started."
        : "Rotation paused.";
    });

    // Return the camera to its starting position.
    resetButton.addEventListener("click", () => {
      camera.alpha = -Math.PI / 2;
      camera.beta = Math.PI / 2.5;
      camera.radius = 6;

      crystal.rotation.y = 0;

      status.textContent =
        "The camera returned to its starting view.";
    });

    // Render only while the Week 4 section is visible.
    engine.runRenderLoop(() => {
      if (
        !canvas.getClientRects().length ||
        document.hidden
      ) {
        return;
      }

      engine.resize();

      if (spinning) {
        crystal.rotation.y +=
          Math.min(engine.getDeltaTime(), 50) * 0.0005;
      }

      scene.render();
    });

    status.textContent =
      "Drag to orbit. Scroll or pinch to zoom. You can also focus the canvas and use the arrow keys.";
  } catch (error) {
    status.textContent =
      "The 3D scene could not start in this browser.";

    console.error(error);
  }
})();