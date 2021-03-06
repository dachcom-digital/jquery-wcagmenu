jquery-wcagmenu
===============

A simple widget to build accessible menus nearly following the WCAG 2.0 specification. 

Features
-------
* Control the menu by keyboard
    * Enter: Open link
    * Space: Open submenu or link, when no submenu present
    * Esc: Close menu
    * Tab: Focus or Blur menu
* You can configure for which level, which cursor-key, performs which action
    * none: does nothing (default)
    * open: opens submenu
    * close: closes submenu
    * left: navigate left
    * leftLoop: navigate left and begin right if start is reached
    * leftClose: navigate left and close submenu if start is reached
    * right: navigate right
    * rightLoop: navigate right and begin left if end is reached
    * rightClose: navigate right and close submenu if end is reached
    * up: navigate up
    * upLoop: navigate up and begin at bottom if top is reached
    * upClose: navigate up and close submenu if top is reached
    * down: navigate down
    * downLoop: navigate down and begin at top if bottom is reached
    * downClose: navigate down and close submenu if bottom is reached
* Good usability for desktop because of its menu aim feature (own implementation)
* Good usability for touch devices because of doubleTapToGo

Demo
-------------
Demo can be found here: http://jquery-wcagmenu.dachcom.ch/demo/

You can also checkout the project and open the index.html in the demo folder (use a webserver).

Dependencies
-------------
- jQuery: http://jquery.com/
- jQuery UI Widget: http://jqueryui.com/
- (Optional) DoubleTapToGo: https://github.com/dachcom-digital/jquery-doubleTapToGo

Installation
-------------

```html
<!-- 1. Create menu markup with class "level-x" on each menu item -->
<nav tabindex="100">
    <ul>
        <li class="level-1"><a href="#11">Level 1 Item 1</a>
            <div class="menu-wrap">
                <ul>
                    <li class="level-2">
                        <a href="#21">Level 2 Item 1</a>

                        <div class="menu-wrap">
                            <ul>
                                <li class="level-3"><a href="#31">Level 3 Item 1</a>

                                    <div class="menu-wrap">
                                        <ul>
                                            <li class="level-4"><a href="#41">Level 4 Item 1</a></li>
                                            <li class="level-4"><a href="#42">Level 4 Item 2</a></li>
                                            <li class="level-4"><a href="#43">Level 4 Item 3</a></li>
                                            <li class="level-4"><a href="#44">Level 4 Item 4</a></li>
                                            <li class="level-4"><a href="#45">Level 4 Item 5</a></li>
                                            <li class="level-4"><a href="#46">Level 4 Item 6</a></li>
                                            <li class="level-4"><a href="#47">Level 4 Item 7</a></li>
                                            <li class="level-4"><a href="#48">Level 4 Item 8</a></li>
                                            <li class="level-4"><a href="#49">Level 4 Item 9</a></li>
                                            <li class="level-4"><a href="#410">Level 4 Item 10</a></li>
                                        </ul>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </li>
        <li class="level-1"><a href="#12">Level 1 Item 2</a></li>
        <li class="level-1"><a href="#13">Level 1 Item 3</a></li>
    </ul>
</nav>

<!-- 2. Include libraries -->
<script src="../lib/jquery.min.js"></script>
<script src="../lib/jquery-ui.min.js"></script>
<script src="../lib/jquery.dcd.doubletaptogo.js"></script>

<!-- 3. Include widget -->
<script src="../src/jquery.dcd.wcagmenu.js"></script>

<!-- 4. Bind widget to menu and configure it -->
<script>
    $(function () {
        $('nav').doubleTapToGo();
        $('nav').wcagmenu({
            controls: {
                1: {
                    left: 'leftLoop',
                    right: 'rightLoop',
                    down: 'open'
                },
                2: {
                    left: 'left',
                    right: 'right',
                    down: 'open',
                    up: 'close'
                },
                3: {
                    right: 'open',
                    down: 'down',
                    up: 'upClose'
                },
                4: {
                    left: 'close',
                    down: 'downLoop',
                    up: 'upLoop'
                }
            }
        });
    });
</script>
```

Configuration
-------------
- **classFocus**: Class for focus `[Default:'focus']`
- **classOpen**: Class for open menu or submenu `[Default:'open']`
- **openDelay**: Delay in ms for opening submenus `[Default:300]`
- **closeDelay**: Delay in ms for closing the menu `[Default:300]`
- **childMenuSelector**: jQuery selector for submenus `[Default:'div:first']`
- **useMenuAim**: There is a smart menu aim logic integrated in the plugin, to make mouse navigation more usable. Deactivate if you just want a simple delay `[Default:true]`
- **controls**: control on which level, which action is performed.
- **useMouseDistanceThreshold**: measure mouse speed to decide if the menu opens with or without delay `[Default:'false']`
- **mouseDistanceThreshold**: mouse distance for threshold `[Default:'10']`

Controls
--------
See demo for example configuration. You can overwrite the configuration with data attributes for each and every single element in the menu. You can use ```data-left```, ```data-right```, ```data-down``` and ```data-up```. 

Menuaim
-------
Menuaim is enabled by default. If you want to disable it for specific menu items, you can use ```data-menuaim="false"``` on them. Always the last focused item is checked for that data attribute, so be sure to use it correctly on child and parent elements.

Events
------
- **wcagmenuopen**: Event is triggered, when a submenu is opened. As parameter the submenu object is provided e.g. 

    ```js
    $('nav').on('wcagmenuopen', function (event, $element) {
    
    }
    ```
- **wcagmenufocus**: Event is triggered, when a menuitem is focused. As parameter the menuitem object is provided e.g. 

    ```js
    $('nav').on('wcagmenufocus', function (event, $element) {
    
    }
    ```
- **wcagmenuclose**: Event is triggered, when a submenu is closed. As parameter the submenu object is provided e.g. 

    ```js
    $('nav').on('wcagmenuclose', function (event, $element) {
    
    }
    ```
- **wcagmenuclosemenu**: Event is triggered, when the menu is closed. As parameter the menu object is provided e.g. 

    ```js
    $('nav').on('wcagmenuclosemenu', function (event, $element) {
    
    }
    ```

Wishlist
--------
* Be more independent of "level-x" classes
* Add aria attributes
* Check usage of roles
* more demos
* separate focus and open for mouse control

Resources
---------
* [Specification](http://www.w3.org/WAI/GL/wiki/Using_ARIA_menus)
* [Inspiration](https://adobe-accessibility.github.io/Accessible-Mega-Menu/)
* [Usability Inspiration](https://github.com/kamens/jQuery-menu-aim)
* [Responsive](https://github.com/dachcom-digital/jquery-doubleTapToGo)

Changelog
---------
### 0.2.2
* [Fix] Compatibility with jQuery 3

### 0.2.1
* [Fix] Links not working when menu losing focus

### 0.2.0
* [Feature] Measure mouse speed to decide if the menu opens with or without delay

### 0.1.7
* [Feature] added option to disable menuaim on specific menu items via data attribute

### 0.1.6
* [Fix] collision with other level classes (like menulevel-1)
* [Fix] focus on element prevents click on links 

### 0.1.5
* [Feature] added 'close' and 'closemenu' event
* [Feature] when menu is focused again, last active first-level item is focused
* [Fix] Not all elements are closed on activation, but only necessary
* [Fix] 'open' class is only rendered on elements with submenus (mouse)

### 0.1.4
* [Feature] added 'focus' event
* [Feature] added minfied version

### 0.1.3
* [Feature] added new action 'none' for resetting
* [Feature] added possibility to rewrite controls with data attributes
* [Fix] open event is now also triggered by keyboard control

### 0.1.2
* [Feature] added 'open' event ('wcagmenuopen')
* [Fix] few bugfixes with keyboard control

### 0.1.1
* [Fix] few bugfixes with mouse and touch control

### 0.1.0
* [Feature] initial release
