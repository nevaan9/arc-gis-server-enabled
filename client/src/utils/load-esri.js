// If you want to load esri dynamically from the CDN
let promise
export const E = {}
export async function load (names) {
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.onload = () => {
        window.require(['esri/config',
          'esri/WebScene',
          'esri/Map',
          'esri/views/SceneView',
          'esri/widgets/Search',
          'esri/widgets/BasemapToggle',
          'esri/widgets/Daylight',
          'esri/widgets/Expand',
          'esri/widgets/Locate',
          'esri/widgets/LayerList',
          // 'esri/widgets/BasemapGallery',
          'esri/layers/GraphicsLayer',
          'esri/layers/SceneLayer',
          'esri/layers/FeatureLayer',
          'esri/layers/TileLayer',
          'esri/layers/Layer',
        ], (esriConfig, WebScene, Map, SceneView, Search, BasemapToggle, Daylight, Expand, Locate, LayerList, GraphicsLayer, SceneLayer, FeatureLayer, TileLayer, Layer) => {
          // esriConfig.apiKey = process.env.ESRI_KEY
          Object.assign(E, { WebScene, SceneView, Map, Search, BasemapToggle, Daylight, Expand, Locate, LayerList, GraphicsLayer, SceneLayer, FeatureLayer, TileLayer, Layer })
          resolve()
        })
      }
      s.onerror = (e) => reject(e)
      s.src = 'https://js.arcgis.com/4.24/'
      document.head.appendChild(s)
      const l = document.createElement('link')
      l.href = 'https://js.arcgis.com/4.24/esri/themes/light/main.css'
      l.type = 'text/css'
      l.rel = 'stylesheet'
      document.head.appendChild(l)
    })
  }
  await promise
}