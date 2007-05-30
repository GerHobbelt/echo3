/**
 * Component rendering peer: ContentPane
 */
EchoRender.ComponentSync.ContentPane = function() { };

EchoRender.ComponentSync.ContentPane.prototype = new EchoRender.ComponentSync;

EchoRender.ComponentSync.ContentPane.prototype.getContainerElement = function(component) {
    return this._childIdToElementMap[component.renderId];
};

EchoRender.ComponentSync.ContentPane.prototype.renderAdd = function(update, parentElement) {
    this._divElement = document.createElement("div");
    this._divElement.id = this.component.renderId;
    this._divElement.style.position = "absolute";
    this._divElement.style.width = "100%";
    this._divElement.style.height = "100%";
    this._divElement.style.overflow = "hidden";
    this._divElement.style.zIndex = "0";
    EchoRender.Property.Color.renderFB(this.component, this._divElement);
    EchoRender.Property.FillImage.renderComponentProperty(this.component, "backgroundImage", null, this._divElement); 

    this._childIdToElementMap = new Object();
    
    var componentCount = this.component.getComponentCount();
    for (var i = 0; i < componentCount; ++i) {
        var child = this.component.getComponent(i);
        this._renderAddChild(update, child);
    }

    parentElement.appendChild(this._divElement);
};

EchoRender.ComponentSync.ContentPane.prototype._renderAddChild = function(update, child) {
    var divElement = document.createElement("div");
    this._childIdToElementMap[child.renderId] = divElement;
    divElement.id = this.component.renderId + "__" + child.renderId;
    divElement.style.position = "absolute";
    if (child.floatingPane) {
        divElement.style.zIndex = "1";
    } else {
        var insets = this.component.getRenderProperty("insets", new EchoApp.Property.Insets(0));
        var pixelInsets = EchoRender.Property.Insets.toPixels(insets);
        divElement.style.zIndex = "0";
        divElement.style.left = pixelInsets.left + "px";
        divElement.style.top = pixelInsets.top + "px";
        divElement.style.bottom = pixelInsets.bottom + "px";
        divElement.style.right = pixelInsets.right + "px";
        EchoWebCore.VirtualPosition.register(divElement.id);
    }
    EchoRender.renderComponentAdd(update, child, divElement);
    this._divElement.appendChild(divElement);
};

EchoRender.ComponentSync.ContentPane.prototype.renderDispose = function(update) { 
    this._childIdToElementMap = null;
    var childElement = this._divElement.firstChild;
    while (childElement) {
        childElement.id = "";
        childElement = childElement.nextSibling;
    }
    this._divElement.id = "";
    this._divElement = null;
};

EchoRender.ComponentSync.ContentPane.prototype._renderRemoveChild = function(update, child) {
    var divElement = this._childIdToElementMap[child.renderId];
    divElement.parentNode.removeChild(divElement);
    delete this._childIdToElementMap[child.renderId];
};

EchoRender.ComponentSync.ContentPane.prototype.renderUpdate = function(update) {
    var fullRender = false;
    if (update.hasUpdatedProperties() || update.hasUpdatedLayoutDataChildren()) {
        // Full render
        fullRender = true;
    } else {
        var removedChildren = update.getRemovedChildren();
        if (removedChildren) {
            // Remove children.
            for (var i = 0; i < removedChildren.length; ++i) {
                this._renderRemoveChild(update, removedChildren[i]);
            }
        }
        var addedChildren = update.getAddedChildren();
        if (addedChildren) {
            // Add children.
            var contentPaneDivElemenet = document.getElementById(this.component.renderId);
            for (var i = 0; i < addedChildren.length; ++i) {
                //FIXME. third attribute is ignored...undecided whether order matters AT ALL here (set by z-index?)
                this._renderAddChild(update, addedChildren[i], this.component.indexOf(addedChildren[i])); 
            }
        }
    }
    if (fullRender) {
        EchoRender.Util.renderRemove(update, update.parent);
        var containerElement = EchoRender.Util.getContainerElement(update.parent);
        this.renderAdd(update, containerElement);
    }
    
    return fullRender;
};

EchoRender.registerPeer("ContentPane", EchoRender.ComponentSync.ContentPane);
