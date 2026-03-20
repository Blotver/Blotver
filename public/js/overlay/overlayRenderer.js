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

    // 🧩 CHILDREN
    const children = [
      ...(data.images || []).map(d => ({ type: "image", data: d })),
      ...(data.texts || []).map(d => ({ type: "text", data: d }))
    ]

    Renderer.renderChildren(
      root, // 🔥🔥🔥 AHORA ES RELATIVO AL SHOUTOUT
      data,
      children,
      screenW,
      screenH
    )

  }

}