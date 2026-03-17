window.OverlayRenderer = {

  render(wrapper, data){

    const screenW = window.innerWidth
    const screenH = window.innerHeight

    // 🎬 CLIP
    const iframe = document.createElement("iframe")

    iframe.src =
      `https://clips.twitch.tv/embed?clip=${data.clipId}&parent=${location.hostname}&autoplay=true`

    iframe.style.position = "absolute"
    iframe.style.inset = "0"
    iframe.style.zIndex = "1"

    wrapper.appendChild(iframe)

    // 🧩 CHILDREN
    const children = [
      ...(data.images || []).map(d => ({type:"image", data:d})),
      ...(data.texts || []).map(d => ({type:"text", data:d}))
    ]

    Renderer.renderChildren(
      wrapper,
      data,
      children,
      screenW,
      screenH
    )

  }

}