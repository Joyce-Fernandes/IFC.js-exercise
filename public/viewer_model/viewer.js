import { Color, MeshBasicMaterial } from "three";
import { IfcViewerAPI } from "web-ifc-viewer";
import { projects } from "./projects.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

// Set Viewer

const container = document.getElementById("viewer_container");
const viewer = new IfcViewerAPI({
  container,
  backgroundColor: new Color("white"),
});

viewer.axes.setAxes();
viewer.grid.setGrid();
viewer.IFC.setWasmPath("wasm/");

const pickMat = new MeshBasicMaterial({
  color: "orange",
  transparent: true,
  opacity: 0.7,
});

const prePickMat = new MeshBasicMaterial({
  color: "white",
  transparent: true,
  opacity: 0.7,
});

viewer.IFC.selector.preselection.material = prePickMat;
viewer.IFC.selector.selection.material = pickMat;

async function loadIfc(url) {
  const model = await viewer.IFC.loadIfcUrl(url);
  const project = await viewer.IFC.getSpatialStructure(model.modelID);
  createTreeMenu(project);
}

// set url

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const currentProjectID = url.searchParams.get("id");

let modelUrl;
const btnTools = document.getElementById("buttonTools")

if (currentProjectID === null) {
  const input = document.getElementById("file_input");
  label.classList.remove("hidden");
  input.addEventListener("change", async () => {
    const file = input.files[0];
    modelUrl = URL.createObjectURL(file);
    loadIfc(modelUrl);
    label.classList.add("hidden");
    btnTools.classList.remove("disabled")
  });
} else {
  const currentProject = projects.find(
    (project) => project.id === currentProjectID
  );
  modelUrl = currentProject.url;
  loadIfc(modelUrl);
  btnTools.classList.remove("disabled")
}
// Get the current project

const currentProject = projects.find(
  (project) => project.id === currentProjectID
);
const projectURL = currentProject.url;
const title = document.getElementById("title");
title.innerText = currentProject.name;

// Buttons

const btnSpatialTree = document.getElementById("buttonTree");
const btnProperty = document.getElementById("buttonProperty");
const btnMeasure = document.getElementById("buttonMeasure");
const btnClipper = document.getElementById("buttonCut");
const btnComment = document.getElementById("buttonComment");

// spatial tree

const ifcTree = document.getElementById("ifcTree");
btnSpatialTree.onclick = () => {
  btnSpatialTree.classList.toggle("buttonActive");
  ifcTree.classList.toggle("hidden");
};

// Tree view

const toggler = document.getElementsByClassName("caret");
for (let i = 0; i < toggler.length; i++) {
  toggler[i].onclick = () => {
    toggler[i].parentElement
      .querySelector(".nested")
      .classList.toggle("active");
    toggler[i].classList.toggle("caret-down");
  };
}

// Spatial tree menu

function createTreeMenu(ifcProject) {
  const root = document.getElementById("tree-root");
  removeAllChildren(root);
  const ifcProjectNode = createNestedChild(root, ifcProject);
  ifcProject.children.forEach((child) => {
    constructTreeMenuNode(ifcProjectNode, child);
  });
}

function nodeToString(node) {
  return `${node.type} - ${node.expressID}`;
}

function constructTreeMenuNode(parent, node) {
  const children = node.children;
  if (children.length === 0) {
    createSimpleChild(parent, node);
    return;
  }
  const nodeElement = createNestedChild(parent, node);
  children.forEach((child) => {
    constructTreeMenuNode(nodeElement, child);
  });
}

function createNestedChild(parent, node) {
  const content = nodeToString(node);
  const root = document.createElement("li");
  createTitle(root, content);
  const childrenContainer = document.createElement("ul");
  childrenContainer.classList.add("nested");
  root.appendChild(childrenContainer);
  parent.appendChild(root);
  return childrenContainer;
}

function createTitle(parent, content) {
  const title = document.createElement("span");
  title.classList.add("caret");
  title.onclick = () => {
    title.parentElement.querySelector(".nested").classList.toggle("active");
    title.classList.toggle("caret-down");
  };
  title.textContent = content;
  parent.appendChild(title);
}

function createSimpleChild(parent, node) {
  const content = nodeToString(node);
  const childNode = document.createElement("li");
  childNode.classList.add("leaf-node");
  childNode.textContent = content;
  childNode.setAttribute("id", node.expressID);
  parent.appendChild(childNode);

  childNode.onclick = () => {
    viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID]);
  };
  childNode.onmousemove = () => {
    viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
  };
}

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

container.onmousemove = () => {
  viewer.IFC.selector.prePickIfcItem();
};

// Property Set

const PropertySet = document.getElementById("PropertySet");
btnProperty.onclick = () => {
  btnProperty.classList.toggle("buttonActive");
  PropertySet.classList.toggle("hidden");
};

container.onclick = async () => {
  const found = await viewer.IFC.selector.pickIfcItem();
  if (!found) {
    viewer.IFC.selector.unpickIfcItems();
    return;
  }
  const result = await viewer.IFC.loader.ifcManager.getItemProperties(
    found.modelID,
    found.id
  );
  createPropertiesMenu(result);
};

const propsGUI = document.getElementById("property-menu");

function createPropertiesMenu(properties) {
  removeAllChildren(propsGUI);

  delete properties.psets;
  delete properties.mats;
  delete properties.type;

  for (let key in properties) {
    createPropertyEntry(key, properties[key]);
  }
}

function createPropertyEntry(key, value) {
  const propContainer = document.createElement("div");
  propContainer.classList.add("property-item");

  if (value === null || value === undefined) value = "undefined";
  else if (value.value) value = value.value;

  const keyElement = document.createElement("div");
  keyElement.textContent = key;
  propContainer.appendChild(keyElement);

  const valueElement = document.createElement("div");
  valueElement.classList.add("property-value");
  valueElement.textContent = value;
  propContainer.appendChild(valueElement);

  propsGUI.appendChild(propContainer);
}

// Clip Plane

btnClipper.onclick = () => {
  btnClipper.classList.toggle("buttonActive");
  clippingPlane();
};

function clippingPlane() {
  if (btnClipper.classList.contains("buttonActive")) {
    viewer.clipper.active = true;

    window.onkeydown = (event) => {
      switch (event.code) {
        case "KeyP":
          viewer.clipper.createPlane();
        case "Delete":
          viewer.clipper.deletePlane();
      }
    };
  } else {
    viewer.clipper.active = false;
  }
}

// Create comment / Measure

const ifcScene = viewer.context.getScene();

function createComment() {
  window.ondblclick = () => {
    const object = viewer.context.castRayIfc();
    const location = object.point;
    const result = window.prompt("Write your comment 🖊:");
    const base = document.createElement("div");
    base.className = "base-label";
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.className = "delete-button hidden";

    base.appendChild(deleteButton);
    base.onmouseenter = () => deleteButton.classList.remove("hidden");
    base.onmouseleave = () => deleteButton.classList.add("hidden");

    const postit = document.createElement("div");
    postit.className = "label";
    postit.textContent = result;
    base.appendChild(postit);

    const ifcJsTitle = new CSS2DObject(base);
    ifcJsTitle.position.copy(location);
    ifcScene.add(ifcJsTitle);

    deleteButton.onclick = () => {
      base.remove();
      ifcJsTitle.element = null;
      ifcJsTitle.removeFromParent();
    };
  };
}

function measure() {
  if (btnMeasure.classList.contains("buttonActive")) {
    viewer.dimensions.active = true;
    viewer.dimensions.previewActive = true;

    window.ondblclick = () => {
      viewer.dimensions.create();
    };

    window.onkeydown = (event) => {
      switch (event.code) {
        case "Escape":
          viewer.dimensions.cancelDrawing();
        case "Delete":
          viewer.dimensions.delete();
      }
    };
  } else {
    viewer.dimensions.active = false;
    viewer.dimensions.previewActive = false;
  }
}

btnMeasure.onclick = () => {
  btnMeasure.classList.toggle("buttonActive");
  if (btnComment.classList.contains("buttonActive")) {
    btnComment.classList.remove("buttonActive");
  }
  measure();
};

btnComment.onclick = () => {
  btnComment.classList.toggle("buttonActive");
  if (btnMeasure.classList.contains("buttonActive")) {
    btnMeasure.classList.remove("buttonActive");
    measure();
  }
  createComment();
};

