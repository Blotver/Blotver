// blotver\public\js\core\renderer.js

window.Renderer = {

  renderChildren(wrapper, parentData, children, screenW, screenH){

    children.forEach(child => {

      const d = child.data

      const x = (Utils.norm(d.x) - parentData.x) * screenW
      const y = (Utils.norm(d.y) - parentData.y) * screenH
      const w = Utils.norm(d.width) * screenW
      const h = Utils.norm(d.height) * screenH

      let el = null

      if(child.type === "image"){
        el = document.createElement("img")
        StyleEngine.applyImage(el, d)
      }

      if(child.type === "text"){
        const container = document.createElement("div")
        const inner = document.createElement("div")

        const parsed = Utils.parseVariables(d.text || "", parentData)
        inner.innerHTML = parsed

        container.style.display = "flex"
        container.style.alignItems = "center"

        if(d.textAlign === "left")
          container.style.justifyContent = "flex-start"
        else if(d.textAlign === "right")
          container.style.justifyContent = "flex-end"
        else
          container.style.justifyContent = "center"

        StyleEngine.applyText(inner, d)
        StyleEngine.applyTextContainer(container, d)

        container.appendChild(inner)
        el = container
      }

      if(!el) return

      el.style.position = "absolute"
      el.style.left = x + "px"
      el.style.top = y + "px"
      el.style.width = w + "px"
      el.style.height = h + "px"
      el.style.zIndex = "5"
      el.style.pointerEvents = "none"

      wrapper.appendChild(el)

    })

  }

}