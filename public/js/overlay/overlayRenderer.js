// blotver\public\js\overlay\overlayRenderer.js

window.OverlayRenderer = {

  render(wrapper, data) {

    const screenW = window.innerWidth
    const screenH = window.innerHeight

    // ===== ROOT (SHOUTOUT) =====
    const root = document.createElement("div")

    root.style.position = "absolute"
    root.style.left = (data.x * screenW) + "px"
    root.style.top = (data.y * screenH) + "px"
    root.style.width = (data.width * screenW) + "px"
    root.style.height = (data.height * screenH) + "px"

    wrapper.appendChild(root)

    // 🎬 CLIP
    const iframe = document.createElement("iframe")

    iframe.src =
      `https://clips.twitch.tv/embed?clip=${data.clipId}&parent=${location.hostname}&autoplay=true`

    iframe.style.position = "absolute"
    iframe.style.inset = "0"
    iframe.style.zIndex = "1"

    root.appendChild(iframe)

    // 🔥 USAR ENGINE REAL

    const widgets = [
      {
        _id: "root",
        type: "shoutout",
        parent: null,
        data
      },

      ...(data.images || []).map((d, i) => ({
        _id: "img_" + i,
        type: "image",
        parent: "root",
        data: d
      })),

      ...(data.texts || []).map((d, i) => ({
        _id: "txt_" + i,
        type: "text",
        parent: "root",
        data: d
      }))
    ];

    const tree = WidgetEngine.buildTree(widgets);

    WidgetEngine.renderTree({
      nodes: tree,
      parentEl: wrapper,
      context: {
        mode: "overlay",
        screenW,
        screenH
      }
    });

    Renderer.renderChildren(
      root, // 🔥🔥🔥 AHORA ES RELATIVO AL SHOUTOUT
      data,
      children,
      screenW,
      screenH
    )

  }

}