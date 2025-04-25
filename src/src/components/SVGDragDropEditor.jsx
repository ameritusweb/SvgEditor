import { useState, useRef, useEffect } from 'react';

// Main component that handles the SVG drag and drop editor
const SVGDragDropEditor = () => {
// State for managing elements in the editor
const [elements, setElements] = useState([]);
const [selectedElement, setSelectedElement] = useState(null);
const [draggedElement, setDraggedElement] = useState(null);
const [offset, setOffset] = useState({ x: 0, y: 0 });
const [isDrawing, setIsDrawing] = useState(false);
const [drawingPath, setDrawingPath] = useState('');
const [pathPoints, setPathPoints] = useState([]);
const [mode, setMode] = useState('select'); // select, rect, circle, text, path, filter, gradient, animation
const [gridSize, setGridSize] = useState(20);
const [showGrid, setShowGrid] = useState(true);
const [snapToGrid, setSnapToGrid] = useState(true);
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);
const [zoomLevel, setZoomLevel] = useState(1);
const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
const [textInput, setTextInput] = useState("");
const [showTextInput, setShowTextInput] = useState(false);
const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
const [isResizing, setIsResizing] = useState(false);
const [resizeDirection, setResizeDirection] = useState('');
const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
const [clipboard, setClipboard] = useState(null);

// Advanced SVG feature states
const [svgFilters, setSvgFilters] = useState([]);
const [svgGradients, setSvgGradients] = useState([]);
const [animations, setAnimations] = useState([]);
const [selectedFilterId, setSelectedFilterId] = useState(null);
const [selectedGradientId, setSelectedGradientId] = useState(null);
const [selectedAnimationId, setSelectedAnimationId] = useState(null);
const [previewAnimation, setPreviewAnimation] = useState(false);
const [timePosition, setTimePosition] = useState(0);
const [showFilterPanel, setShowFilterPanel] = useState(false);
const [showGradientPanel, setShowGradientPanel] = useState(false);
const [showAnimationPanel, setShowAnimationPanel] = useState(false);

// References
const svgRef = useRef(null);
const textInputRef = useRef(null);

// Generate unique IDs for elements
const generateId = () => `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
// Add to history when elements change
useEffect(() => {
  if (elements.length > 0 && (history.length === 0 || JSON.stringify(history[historyIndex]) !== JSON.stringify(elements))) {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }
}, [elements]);

// Animation timer for previews
useEffect(() => {
  if (previewAnimation) {
    const timer = setInterval(() => {
      setTimePosition(prev => prev + 50);
    }, 50);
    return () => clearInterval(timer);
  }
}, [previewAnimation]);

// Focus text input when it appears
useEffect(() => {
  if (showTextInput && textInputRef.current) {
    textInputRef.current.focus();
  }
}, [showTextInput]);

// Snap value to grid
const snapToGridValue = (value) => {
  return snapToGrid ? Math.round(value / gridSize) * gridSize : value;
};

// Element creation functions
const createRectangle = (x, y, width = 100, height = 80) => {
  return {
    id: generateId(),
    type: 'rect',
    x: snapToGridValue(x),
    y: snapToGridValue(y),
    width,
    height,
    fill: '#ADD8E6',
    stroke: '#0000FF',
    strokeWidth: 2,
  };
};

const createCircle = (x, y, radius = 50) => {
  return {
    id: generateId(),
    type: 'circle',
    cx: snapToGridValue(x),
    cy: snapToGridValue(y),
    r: radius,
    fill: 'lightgreen',
    stroke: 'green',
    strokeWidth: 2,
  };
};

const createText = (x, y, text = 'Text') => {
  return {
    id: generateId(),
    type: 'text',
    x: snapToGridValue(x),
    y: snapToGridValue(y),
    text,
    fontSize: 20,
    fontFamily: 'Arial',
    fill: 'black',
  };
};

const createPath = (points) => {
  // Create SVG path from points
  const pathData = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');
  
  return {
    id: generateId(),
    type: 'path',
    d: pathData,
    fill: 'none',
    stroke: 'red',
    strokeWidth: 2,
  };
};

// Create quantum effect element
const createQuantumEffect = (x, y) => {
  // Create a quantum anomaly similar to the example
  const id = generateId();
  const anomalyId = `anomaly-${id}`;
  const gradientId = `gradient-${id}`;
  const noiseId = `noise-${id}`;
  
  // Create the filter
  const noiseFilter = {
    id: noiseId,
    type: 'turbulence',
    props: { 
      type: 'fractalNoise',
      baseFrequency: 0.01,
      numOctaves: 3,
      seed: Math.floor(Math.random() * 100)
    },
    name: `Quantum Noise`
  };
  setSvgFilters([...svgFilters, noiseFilter]);
  
  // Create the gradient
  const pitGradient = {
    id: gradientId,
    type: 'radial',
    props: { cx: 0.5, cy: 0.5, r: 0.8, fx: 0.5, fy: 0.5 },
    stops: [
      { offset: 0, color: '#1a237e', opacity: 0.8 },
      { offset: 70, color: '#311b92', opacity: 0.6 },
      { offset: 100, color: '#4a148c', opacity: 0.4 }
    ],
    name: `Quantum Gradient`
  };
  setSvgGradients([...svgGradients, pitGradient]);
  
  // Create the main element (ellipse)
  const quantumElement = {
    id,
    type: 'ellipse',
    cx: snapToGridValue(x),
    cy: snapToGridValue(y),
    rx: 150,
    ry: 100,
    fill: `url(#${gradientId})`,
    filter: noiseId
  };
  
  // Create pulse animation
  const pulseAnimation = {
    id: `anim-${Date.now()}`,
    elementId: id,
    type: 'attribute',
    attributeName: 'ry',
    from: 100,
    to: 120,
    dur: 3,
    repeatCount: 'indefinite',
    name: 'Quantum Pulse'
  };
  setAnimations([...animations, pulseAnimation]);
  
  // Add rings as separate elements
  const elements = [quantumElement];
  
  // Add rings
  for (let i = 0; i < 3; i++) {
    const scale = 1 - i * 0.2;
    const ringId = generateId();
    
    const ring = {
      id: ringId,
      type: 'ellipse',
      cx: snapToGridValue(x),
      cy: snapToGridValue(y),
      rx: 150 * scale,
      ry: 100 * scale,
      fill: 'none',
      stroke: '#B388FF',
      strokeWidth: 2,
      strokeDasharray: '10,20'
    };
    
    elements.push(ring);
    
    // Add rotation animation for each ring
    const rotationAnim = {
      id: `anim-${Date.now()}-${i}`,
      elementId: ringId,
      type: 'rotate',
      attributeName: 'transform',
      from: 0,
      to: 360,
      dur: 3 + i,
      repeatCount: 'indefinite',
      name: `Ring Rotation ${i+1}`
    };
    setAnimations([...animations, rotationAnim]);
  }
  
  return elements;
};

// Handle mouse down on the SVG canvas
const handleMouseDown = (e) => {
  const svgPoint = getSVGCoordinates(e);
  
  if (mode === 'select') {
    // Check if we're clicking on a resize handle
    if (selectedElement && e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      const direction = e.target.dataset.direction;
      setResizeDirection(direction);
      setInitialSize({ 
        width: selectedElement.width || selectedElement.r * 2, 
        height: selectedElement.height || selectedElement.r * 2 
      });
      setInitialPosition({ 
        x: selectedElement.x || selectedElement.cx - selectedElement.r, 
        y: selectedElement.y || selectedElement.cy - selectedElement.r 
      });
      return;
    }
    
    // Check if we're clicking on an existing element
    const clickedElement = elements.find(el => isPointInElement(svgPoint, el));
    
    if (clickedElement) {
      setSelectedElement(clickedElement);
      setDraggedElement(clickedElement);
      
      // Calculate offset for dragging
      if (clickedElement.type === 'rect' || clickedElement.type === 'text' || clickedElement.type === 'ellipse') {
        setOffset({
          x: svgPoint.x - (clickedElement.x || clickedElement.cx),
          y: svgPoint.y - (clickedElement.y || clickedElement.cy)
        });
      } else if (clickedElement.type === 'circle') {
        setOffset({
          x: svgPoint.x - clickedElement.cx,
          y: svgPoint.y - clickedElement.cy
        });
      } else if (clickedElement.type === 'path') {
        // For path, we need the bounding box
        const bbox = getBoundingBox(clickedElement);
        setOffset({
          x: svgPoint.x - bbox.x,
          y: svgPoint.y - bbox.y
        });
      }
    } else {
      // Clicked on empty space, deselect
      setSelectedElement(null);
    }
  } else if (mode === 'rect') {
    // Start creating a rectangle
    const newRect = createRectangle(svgPoint.x, svgPoint.y, 0, 0);
    setElements([...elements, newRect]);
    setSelectedElement(newRect);
    setDraggedElement(newRect);
    setIsResizing(true);
    setResizeDirection('se');
    setInitialPosition({ x: svgPoint.x, y: svgPoint.y });
  } else if (mode === 'circle') {
    // Start creating a circle
    const newCircle = createCircle(svgPoint.x, svgPoint.y, 0);
    setElements([...elements, newCircle]);
    setSelectedElement(newCircle);
    setDraggedElement(newCircle);
    setIsResizing(true);
    setResizeDirection('se');
    setInitialPosition({ x: svgPoint.x, y: svgPoint.y });
  } else if (mode === 'text') {
    // Position text input at click position
    setTextPosition({ x: svgPoint.x, y: svgPoint.y });
    setShowTextInput(true);
  } else if (mode === 'path') {
    // Start drawing a path
    setIsDrawing(true);
    setPathPoints([svgPoint]);
    setDrawingPath(`M ${svgPoint.x} ${svgPoint.y}`);
  } else if (mode === 'quantum') {
    // Create a quantum effect
    const quantumElements = createQuantumEffect(svgPoint.x, svgPoint.y);
    setElements([...elements, ...quantumElements]);
    setSelectedElement(quantumElements[0]);
    setMode('select'); // Switch back to select mode
  }
};

// Handle mouse move on the SVG canvas
const handleMouseMove = (e) => {
  if (!draggedElement && !isDrawing && !isResizing) return;
  
  const svgPoint = getSVGCoordinates(e);
  
  if (isResizing && selectedElement) {
    // Handle resizing
    const newElements = [...elements];
    const index = newElements.findIndex(el => el.id === selectedElement.id);
    
    if (index === -1) return;
    
    const el = newElements[index];
    let newWidth, newHeight, newX, newY;
    
    // Resize based on element type and direction
    if (el.type === 'rect' || el.type === 'text') {
      const deltaX = svgPoint.x - initialPosition.x;
      const deltaY = svgPoint.y - initialPosition.y;
      
      if (resizeDirection.includes('e')) {
        newWidth = snapToGridValue(Math.max(20, initialSize.width + deltaX));
      }
      if (resizeDirection.includes('w')) {
        newWidth = snapToGridValue(Math.max(20, initialSize.width - deltaX));
        newX = snapToGridValue(initialPosition.x + initialSize.width - newWidth);
      }
      if (resizeDirection.includes('s')) {
        newHeight = snapToGridValue(Math.max(20, initialSize.height + deltaY));
      }
      if (resizeDirection.includes('n')) {
        newHeight = snapToGridValue(Math.max(20, initialSize.height - deltaY));
        newY = snapToGridValue(initialPosition.y + initialSize.height - newHeight);
      }
      
      // Update element properties
      if (newWidth !== undefined) el.width = newWidth;
      if (newHeight !== undefined) el.height = newHeight;
      if (newX !== undefined) el.x = newX;
      if (newY !== undefined) el.y = newY;
    } else if (el.type === 'circle') {
      // For circle, resize by changing radius
      const dx = svgPoint.x - el.cx;
      const dy = svgPoint.y - el.cy;
      const newRadius = snapToGridValue(Math.max(10, Math.sqrt(dx * dx + dy * dy)));
      el.r = newRadius;
    }
    
    setElements(newElements);
  } else if (draggedElement) {
    // Handle dragging existing elements
    const newElements = [...elements];
    const index = newElements.findIndex(el => el.id === draggedElement.id);
    
    if (index === -1) return;
    
    const newX = snapToGridValue(svgPoint.x - offset.x);
    const newY = snapToGridValue(svgPoint.y - offset.y);
    
    if (draggedElement.type === 'rect' || draggedElement.type === 'text') {
      newElements[index] = { ...newElements[index], x: newX, y: newY };
    } else if (draggedElement.type === 'circle') {
      newElements[index] = { ...newElements[index], cx: newX, cy: newY };
    } else if (draggedElement.type === 'path') {
      // For path, translate all points
      const bbox = getBoundingBox(draggedElement);
      const translateX = newX - bbox.x;
      const translateY = newY - bbox.y;
      
      // Parse and transform path data
      const pathData = draggedElement.d;
      const commands = pathData.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
      
      let newPathData = commands.map(cmd => {
        const type = cmd.charAt(0);
        if (type === 'M' || type === 'L') {
          const [_, x, y] = cmd.match(/([MLml])\s*([^,\s]+)[,\s]([^,\s]+)/) || [null, type, 0, 0];
          return `${type} ${parseFloat(x) + translateX} ${parseFloat(y) + translateY}`;
        }
        return cmd;
      }).join(' ');
      
      newElements[index] = { ...newElements[index], d: newPathData };
    }
    
    setElements(newElements);
    setSelectedElement(newElements[index]);
  } else if (isDrawing) {
    // Continue drawing path
    const newPoints = [...pathPoints, svgPoint];
    setPathPoints(newPoints);
    
    // Update path data
    const newPathData = newPoints.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, '');
    
    setDrawingPath(newPathData);
  }
};

// Handle mouse up on the SVG canvas
const handleMouseUp = () => {
  if (isDrawing) {
    // Finish drawing path
    if (pathPoints.length > 1) {
      const newPath = createPath(pathPoints);
      setElements([...elements, newPath]);
      setSelectedElement(newPath);
    }
    setIsDrawing(false);
    setPathPoints([]);
    setDrawingPath('');
  }
  
  setDraggedElement(null);
  setIsResizing(false);
};

// Handle key down events
const handleKeyDown = (e) => {
  // Undo/Redo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    if (e.shiftKey) {
      // Redo
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setElements([...history[historyIndex + 1]]);
      }
    } else {
      // Undo
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setElements([...history[historyIndex - 1]]);
      }
    }
  }
  
  // Delete selected element
  if (e.key === 'Delete' && selectedElement) {
    setElements(elements.filter(el => el.id !== selectedElement.id));
    setSelectedElement(null);
  }
  
  // Copy/Paste
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement) {
    setClipboard({ ...selectedElement, id: null });
  }
  
  if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
    const newElement = { ...clipboard, id: generateId() };
    
    // Offset pasted element slightly
    if (newElement.type === 'rect' || newElement.type === 'text') {
      newElement.x += 20;
      newElement.y += 20;
    } else if (newElement.type === 'circle') {
      newElement.cx += 20;
      newElement.cy += 20;
    } else if (newElement.type === 'path') {
      // Offset path points
      const pathData = newElement.d;
      const commands = pathData.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
      
      let newPathData = commands.map(cmd => {
        const type = cmd.charAt(0);
        if (type === 'M' || type === 'L') {
          const [_, x, y] = cmd.match(/([MLml])\s*([^,\s]+)[,\s]([^,\s]+)/) || [null, type, 0, 0];
          return `${type} ${parseFloat(x) + 20} ${parseFloat(y) + 20}`;
        }
        return cmd;
      }).join(' ');
      
      newElement.d = newPathData;
    }
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  }
};

// Handle creating text elements
const handleTextInputComplete = () => {
  if (textInput.trim()) {
    const newText = createText(textPosition.x, textPosition.y, textInput);
    setElements([...elements, newText]);
    setSelectedElement(newText);
  }
  setShowTextInput(false);
  setTextInput("");
};

// Helper: Check if a point is inside an element
const isPointInElement = (point, element) => {
  if (element.type === 'rect') {
    return (
      point.x >= element.x &&
      point.x <= element.x + element.width &&
      point.y >= element.y &&
      point.y <= element.y + element.height
    );
  } else if (element.type === 'circle') {
    const dx = point.x - element.cx;
    const dy = point.y - element.cy;
    return dx * dx + dy * dy <= element.r * element.r;
  } else if (element.type === 'ellipse') {
    // Ellipse hit testing
    const rx = element.rx || 0;
    const ry = element.ry || 0;
    if (rx === 0 || ry === 0) return false;
    
    const dx = (point.x - element.cx) / rx;
    const dy = (point.y - element.cy) / ry;
    return dx * dx + dy * dy <= 1;
  } else if (element.type === 'text') {
    // Approximate text bounding box
    const textWidth = element.text.length * (element.fontSize * 0.6);
    const textHeight = element.fontSize * 1.2;
    return (
      point.x >= element.x &&
      point.x <= element.x + textWidth &&
      point.y >= element.y - textHeight &&
      point.y <= element.y
    );
  } else if (element.type === 'path') {
    // For paths, check if point is near any segment
    // This is a simple implementation - production would use more accurate hit testing
    const bbox = getBoundingBox(element);
    const buffer = 5; // Click tolerance
    return (
      point.x >= bbox.x - buffer &&
      point.x <= bbox.x + bbox.width + buffer &&
      point.y >= bbox.y - buffer &&
      point.y <= bbox.y + bbox.height + buffer
    );
  }
  return false;
};

// Helper: Get SVG coordinates from mouse event
const getSVGCoordinates = (event) => {
  const svg = svgRef.current;
  if (!svg) return { x: 0, y: 0 };
  
  const CTM = svg.getScreenCTM();
  return {
    x: (event.clientX - CTM.e) / CTM.a / zoomLevel + viewBox.x,
    y: (event.clientY - CTM.f) / CTM.d / zoomLevel + viewBox.y
  };
};

// Helper: Get bounding box for a path
const getBoundingBox = (pathElement) => {
  if (pathElement.type !== 'path') return { x: 0, y: 0, width: 0, height: 0 };
  
  // Parse path data
  const commands = pathElement.d.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  commands.forEach(cmd => {
    const type = cmd.charAt(0);
    if (type === 'M' || type === 'L') {
      const [_, x, y] = cmd.match(/([MLml])\s*([^,\s]+)[,\s]([^,\s]+)/) || [null, type, 0, 0];
      const numX = parseFloat(x);
      const numY = parseFloat(y);
      
      minX = Math.min(minX, numX);
      minY = Math.min(minY, numY);
      maxX = Math.max(maxX, numX);
      maxY = Math.max(maxY, numY);
    }
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};

// Helper functions for path animation
const generatePathVariations = (pathData, numVariations, intensity = 0.5) => {
  // Parse path data into segments
  const pathSegments = parsePath(pathData);
  const variations = [];
  
  for (let i = 0; i < numVariations; i++) {
    const newSegments = pathSegments.map(segment => {
      // Only modify coordinate values
      if (segment.command === 'M' || segment.command === 'L') {
        return {
          ...segment,
          x: segment.x + (Math.random() - 0.5) * 20 * intensity,
          y: segment.y + (Math.random() - 0.5) * 20 * intensity
        };
      }
      return segment;
    });
    
    variations.push(stringifyPath(newSegments));
  }
  
  // Make sure to return to original shape (for smooth cycles)
  variations.push(pathData);
  return variations.join(';');
};

const generateJitterPaths = (pathData, intensity, numVariations) => {
  const pathSegments = parsePath(pathData);
  const variations = [];
  
  for (let i = 0; i < numVariations; i++) {
    const newSegments = pathSegments.map(segment => {
      if (segment.command === 'M' || segment.command === 'L') {
        // Create random jitter
        const jitterX = (Math.random() - 0.5) * intensity;
        const jitterY = (Math.random() - 0.5) * intensity;
        
        return {
          ...segment,
          x: segment.x + jitterX,
          y: segment.y + jitterY
        };
      }
      return segment;
    });
    
    variations.push(stringifyPath(newSegments));
  }
  
  // Add original path to ensure the animation loops smoothly
  variations.push(pathData);
  return variations.join(';');
};

const generateWavePaths = (pathData, intensity, numVariations) => {
  const pathSegments = parsePath(pathData);
  const variations = [];
  
  for (let i = 0; i < numVariations; i++) {
    const phase = (i / numVariations) * Math.PI * 2;
    
    const newSegments = pathSegments.map((segment, index) => {
      if (segment.command === 'M' || segment.command === 'L') {
        // Create sine wave effect
        const waveOffset = Math.sin(phase + index * 0.5) * intensity;
        
        return {
          ...segment,
          x: segment.x + waveOffset,
          y: segment.y + waveOffset * 0.5 // Less vertical movement
        };
      }
      return segment;
    });
    
    variations.push(stringifyPath(newSegments));
  }
  
  // Add original path to ensure the animation loops smoothly
  variations.push(pathData);
  return variations.join(';');
};

// Parse SVG path data into segments
const parsePath = (pathData) => {
  const segments = [];
  const commands = pathData.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);
  
  commands.forEach(cmd => {
    const type = cmd.charAt(0);
    
    if (type === 'M' || type === 'L') {
      const [_, x, y] = cmd.match(/([MLml])\s*([^,\s]+)[,\s]([^,\s]+)/) || [null, type, 0, 0];
      segments.push({
        command: type,
        x: parseFloat(x),
        y: parseFloat(y)
      });
    } else {
      // For other commands, just store the raw data
      segments.push({
        command: type,
        raw: cmd
      });
    }
  });
  
  return segments;
};

// Convert parsed segments back to path data string
const stringifyPath = (segments) => {
  return segments.map(segment => {
    if (segment.command === 'M' || segment.command === 'L') {
      return `${segment.command} ${segment.x} ${segment.y}`;
    } else {
      return segment.raw;
    }
  }).join(' ');
};

// Zoom handling
const handleZoom = (factor) => {
  const newZoom = Math.max(0.1, Math.min(5, zoomLevel * factor));
  setZoomLevel(newZoom);
  
  // Adjust viewBox to keep center point
  const centerX = viewBox.x + viewBox.width / 2;
  const centerY = viewBox.y + viewBox.height / 2;
  
  const newWidth = 800 / newZoom;
  const newHeight = 600 / newZoom;
  
  setViewBox({
    x: centerX - newWidth / 2,
    y: centerY - newHeight / 2,
    width: newWidth,
    height: newHeight
  });
};

// Pan handling
const handlePan = (dx, dy) => {
  setViewBox({
    ...viewBox,
    x: viewBox.x - dx / zoomLevel,
    y: viewBox.y - dy / zoomLevel
  });
};

// Export to SVG
const exportSVG = () => {
  const svgData = svgRef.current.outerHTML;
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'design.svg';
  link.click();
  
  URL.revokeObjectURL(url);
};

// Render resize handles for selected element
const renderResizeHandles = () => {
  if (!selectedElement) return null;
  
  let x, y, width, height;
  
  if (selectedElement.type === 'rect' || selectedElement.type === 'text') {
    x = selectedElement.x;
    y = selectedElement.y;
    width = selectedElement.width || (selectedElement.text?.length * selectedElement.fontSize * 0.6) || 100;
    height = selectedElement.height || selectedElement.fontSize * 1.2 || 20;
  } else if (selectedElement.type === 'circle') {
    x = selectedElement.cx - selectedElement.r;
    y = selectedElement.cy - selectedElement.r;
    width = selectedElement.r * 2;
    height = selectedElement.r * 2;
  } else if (selectedElement.type === 'path') {
    const bbox = getBoundingBox(selectedElement);
    x = bbox.x;
    y = bbox.y;
    width = bbox.width;
    height = bbox.height;
  }
  
  const handleSize = 8;
  const handleOffset = handleSize / 2;
  
  const handles = [
    { direction: 'nw', x: x - handleOffset, y: y - handleOffset },
    { direction: 'n', x: x + width / 2 - handleOffset, y: y - handleOffset },
    { direction: 'ne', x: x + width - handleOffset, y: y - handleOffset },
    { direction: 'w', x: x - handleOffset, y: y + height / 2 - handleOffset },
    { direction: 'e', x: x + width - handleOffset, y: y + height / 2 - handleOffset },
    { direction: 'sw', x: x - handleOffset, y: y + height - handleOffset },
    { direction: 's', x: x + width / 2 - handleOffset, y: y + height - handleOffset },
    { direction: 'se', x: x + width - handleOffset, y: y + height - handleOffset },
  ];
  
  return (
    <>
      {/* Selection outline */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#4285F4"
        strokeWidth={1}
        strokeDasharray="5,5"
        pointerEvents="none"
      />
      
      {/* Resize handles */}
      {handles.map((handle, i) => (
        <rect
          key={`handle-${i}`}
          className="resize-handle"
          data-direction={handle.direction}
          x={handle.x}
          y={handle.y}
          width={handleSize}
          height={handleSize}
          fill="#4285F4"
          stroke="#fff"
          strokeWidth={1}
          style={{ cursor: `${handle.direction}-resize` }}
        />
      ))}
    </>
  );
};

// Render grid in the background
const renderGrid = () => {
  if (!showGrid) return null;
  
  const gridLines = [];
  const width = viewBox.width;
  const height = viewBox.height;
  const startX = Math.floor(viewBox.x / gridSize) * gridSize;
  const startY = Math.floor(viewBox.y / gridSize) * gridSize;
  
  // Vertical grid lines
  for (let x = startX; x < viewBox.x + width; x += gridSize) {
    gridLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={viewBox.y}
        x2={x}
        y2={viewBox.y + height}
        stroke="#ccc"
        strokeWidth={0.5}
        strokeDasharray={x % (gridSize * 5) === 0 ? "none" : "2,2"}
      />
    );
  }
  
  // Horizontal grid lines
  for (let y = startY; y < viewBox.y + height; y += gridSize) {
    gridLines.push(
      <line
        key={`h-${y}`}
        x1={viewBox.x}
        y1={y}
        x2={viewBox.x + width}
        y2={y}
        stroke="#ccc"
        strokeWidth={0.5}
        strokeDasharray={y % (gridSize * 5) === 0 ? "none" : "2,2"}
      />
    );
  }
  
  return gridLines;
};

// Render elements on the canvas
const renderElements = () => {
  return elements.map(element => {
    let elementProps = {};
    
    // Add filter if exists
    if (element.filter) {
      elementProps.filter = `url(#${element.filter})`;
    }
    
    // Add ID for animation targeting
    elementProps.id = element.id;

    // Add permanently applied animations
    const animElements = element.animations?.map(anim => {
      const { id, ...commonProps } = {
        id: anim.id,
        dur: `${anim.dur}s`,
        repeatCount: anim.repeatCount || "indefinite",
        begin: anim.beginTime ? `${anim.beginTime}s` : "0s"
      };

      if (anim.type === 'rotate') {
        return (
          <animateTransform
            key={id}
            {...commonProps}
            attributeName="transform"
            type="rotate"
            from={`${anim.from} ${element.cx || element.x + (element.width/2) || 0} ${element.cy || element.y + (element.height/2) || 0}`}
            to={`${anim.to} ${element.cx || element.x + (element.width/2) || 0} ${element.cy || element.y + (element.height/2) || 0}`}
            additive="sum"
          />
        );
      } else if (anim.type === 'scale') {
        return (
          <animateTransform
            key={id}
            {...commonProps}
            attributeName="transform"
            type="scale"
            from={anim.from}
            to={anim.to}
            additive="sum"
          />
        );
      } else if (anim.type === 'colorShift') {
        return (
          <animate
            key={id}
            {...commonProps}
            attributeName={anim.attributeName}
            values={anim.values}
          />
        );
      } else if (anim.type === 'motion' && anim.values) {
        return (
          <animate
            key={id}
            {...commonProps}
            attributeName={anim.attributeName}
            values={anim.values}
            keyTimes={anim.keyTimes}
          />
        );
      } else if (anim.type === 'attribute') {
        return (
          <animate
            key={id}
            {...commonProps}
            attributeName={anim.attributeName}
            from={anim.from}
            to={anim.to}
          />
        );
      }
      return null;
    });
    
    if (element.type === 'rect') {
      // Calculate center point for transformations
      const centerX = element.x + (element.width / 2);
      const centerY = element.y + (element.height / 2);
      
      return (
        <g key={element.id} transform={`translate(${centerX},${centerY})`}>
          <rect
            key={`${element.id}-rect`}
            x={-element.width/2}
            y={-element.height/2}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            {...elementProps}
          />
          {animElements}
        </g>
      );
    } else if (element.type === 'circle') {
      return (
        <g key={element.id} transform={`translate(${element.cx},${element.cy})`}>
          <circle
            key={`${element.id}-circle`}
            cx={0}
            cy={0}
            r={element.r}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            {...elementProps}
          />
          {animElements}
        </g>
      );
    } else if (element.type === 'ellipse') {
      return (
        <g key={element.id} transform={`translate(${element.cx},${element.cy})`}>
          <ellipse
            key={`${element.id}-ellipse`}
            cx={0}
            cy={0}
            rx={element.rx}
            ry={element.ry}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            strokeDasharray={element.strokeDasharray}
            {...elementProps}
          />
          {animElements}
        </g>
      );
    } else if (element.type === 'text') {
      return (
        <g key={element.id} transform={`translate(${element.x},${element.y})`}>
          <text
            key={`${element.id}-text`}
            x={0}
            y={0}
            fontFamily={element.fontFamily}
            fontSize={element.fontSize}
            fill={element.fill}
            {...elementProps}
          >
            {element.text}
          </text>
          {animElements}
        </g>
      );
    } else if (element.type === 'path') {
      // Get path bounding box for center point
      const bbox = getBoundingBox(element);
      const centerX = bbox.x + (bbox.width / 2);
      const centerY = bbox.y + (bbox.height / 2);
      
      // Adjust path data relative to center
      const adjustedPathData = element.d.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/).map(cmd => {
        const type = cmd.charAt(0);
        if (type === 'M' || type === 'L') {
          const [_, x, y] = cmd.match(/([MLml])\s*([^,\s]+)[,\s]([^,\s]+)/) || [null, type, 0, 0];
          return `${type} ${parseFloat(x) - centerX} ${parseFloat(y) - centerY}`;
        }
        return cmd;
      }).join(' ');
      
      return (
        <g key={element.id} transform={`translate(${centerX},${centerY})`}>
          <path
            key={`${element.id}-path`}
            d={adjustedPathData}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            strokeDasharray={element.strokeDasharray}
            {...elementProps}
          />
          {animElements}
        </g>
      );
    }
    return null;
  });
};

return (
  <div className="flex flex-col h-screen">
    {/* Toolbar */}
    <div className="p-2 bg-gray-100 border-b flex items-center">
      <div className="flex space-x-2 mr-4">
        <button
          className={`px-3 py-1 rounded ${mode === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('select')}
        >
          Select
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'rect' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('rect')}
        >
          Rectangle
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('circle')}
        >
          Circle
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('text')}
        >
          Text
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'path' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setMode('path')}
        >
          Path
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'filter' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => {
            setMode('filter');
            setShowFilterPanel(true);
            setShowGradientPanel(false);
            setShowAnimationPanel(false);
          }}
        >
          Filters
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'gradient' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => {
            setMode('gradient');
            setShowFilterPanel(false);
            setShowGradientPanel(true);
            setShowAnimationPanel(false);
          }}
        >
          Gradients
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'animation' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => {
            setMode('animation');
            setShowFilterPanel(false);
            setShowGradientPanel(false);
            setShowAnimationPanel(true);
          }}
        >
          Animation
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === 'quantum' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => {
            setMode('quantum');
            setShowFilterPanel(false);
            setShowGradientPanel(false);
            setShowAnimationPanel(false);
          }}
        >
          Quantum
        </button>
      </div>
      
      <div className="flex space-x-2 mr-4">
        <button
          className="px-3 py-1 rounded bg-gray-200"
          onClick={() => historyIndex > 0 && setHistoryIndex(historyIndex - 1) && setElements([...history[historyIndex - 1]])}
          disabled={historyIndex <= 0}
        >
          Undo
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-200"
          onClick={() => historyIndex < history.length - 1 && setHistoryIndex(historyIndex + 1) && setElements([...history[historyIndex + 1]])}
          disabled={historyIndex >= history.length - 1}
        >
          Redo
        </button>
      </div>
      
      <div className="flex items-center text-gray-900 space-x-2 mr-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={() => setShowGrid(!showGrid)}
            className="mr-1"
          />
          Grid
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={() => setSnapToGrid(!snapToGrid)}
            className="mr-1"
          />
          Snap
        </label>
        <div className="flex items-center space-x-1">
          <span>Zoom:</span>
          <button
            className="px-2 py-1 text-white rounded bg-gray-200"
            onClick={() => handleZoom(0.9)}
          >
            -
          </button>
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button
            className="px-2 py-1 text-white rounded bg-gray-200"
            onClick={() => handleZoom(1.1)}
          >
            +
          </button>
        </div>
      </div>
      
      <button
        className="ml-auto px-3 py-1 rounded bg-green-500 text-white"
        onClick={exportSVG}
      >
        Export SVG
      </button>
    </div>
    
    {/* Properties panel for selected element */}
    {selectedElement && (
      <div className="p-2 bg-gray-100 text-gray-900 border-b">
        <div className="flex flex-wrap gap-2">
          {/* Common properties */}
          <div className="flex items-center">
            <span className="mr-1">Fill:</span>
            <input
              type="color"
              value={selectedElement.fill || "#000000"}
              onChange={(e) => {
                const newElements = [...elements];
                const index = newElements.findIndex(el => el.id === selectedElement.id);
                if (index !== -1) {
                  newElements[index] = { ...newElements[index], fill: e.target.value };
                  setElements(newElements);
                  setSelectedElement(newElements[index]);
                }
              }}
            />
          </div>
          
          {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'path') && (
            <div className="flex items-center">
              <span className="mr-1">Stroke:</span>
              <input
                type="color"
                value={selectedElement.stroke || "#000000"}
                onChange={(e) => {
                  const newElements = [...elements];
                  const index = newElements.findIndex(el => el.id === selectedElement.id);
                  if (index !== -1) {
                    newElements[index] = { ...newElements[index], stroke: e.target.value };
                    setElements(newElements);
                    setSelectedElement(newElements[index]);
                  }
                }}
              />
            </div>
          )}
          
          {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'path') && (
            <div className="flex items-center">
              <span className="mr-1">Stroke Width:</span>
              <input
                type="number"
                min="0"
                max="20"
                value={selectedElement.strokeWidth || 1}
                onChange={(e) => {
                  const newElements = [...elements];
                  const index = newElements.findIndex(el => el.id === selectedElement.id);
                  if (index !== -1) {
                    newElements[index] = { ...newElements[index], strokeWidth: parseInt(e.target.value) };
                    setElements(newElements);
                    setSelectedElement(newElements[index]);
                  }
                }}
                className="w-16 p-1 border rounded"
              />
            </div>
          )}
          
          {/* Type-specific properties */}
          {selectedElement.type === 'text' && (
            <>
              <div className="flex items-center">
                <span className="mr-1">Text:</span>
                <input
                  type="text"
                  value={selectedElement.text || ""}
                  onChange={(e) => {
                    const newElements = [...elements];
                    const index = newElements.findIndex(el => el.id === selectedElement.id);
                    if (index !== -1) {
                      newElements[index] = { ...newElements[index], text: e.target.value };
                      setElements(newElements);
                      setSelectedElement(newElements[index]);
                    }
                  }}
                  className="p-1 border rounded"
                />
              </div>
              <div className="flex items-center">
                <span className="mr-1">Font Size:</span>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={selectedElement.fontSize || 20}
                  onChange={(e) => {
                    const newElements = [...elements];
                    const index = newElements.findIndex(el => el.id === selectedElement.id);
                    if (index !== -1) {
                      newElements[index] = { ...newElements[index], fontSize: parseInt(e.target.value) };
                      setElements(newElements);
                      setSelectedElement(newElements[index]);
                    }
                  }}
                  className="w-16 p-1 border rounded"
                />
              </div>
              <div className="flex items-center">
                <span className="mr-1">Font:</span>
                <select
                  value={selectedElement.fontFamily || "Arial"}
                  onChange={(e) => {
                    const newElements = [...elements];
                    const index = newElements.findIndex(el => el.id === selectedElement.id);
                    if (index !== -1) {
                      newElements[index] = { ...newElements[index], fontFamily: e.target.value };
                      setElements(newElements);
                      setSelectedElement(newElements[index]);
                    }
                  }}
                  className="p-1 border rounded"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    )}
    
    {/* Main editor area */}
    <div className="flex-grow relative overflow-hidden bg-gray-50">
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        className="focus:outline-none"
      >
        {/* Background */}
        <rect
          x={viewBox.x}
          y={viewBox.y}
          width={viewBox.width}
          height={viewBox.height}
          fill="white"
        />
        
        {/* Grid */}
        {renderGrid()}
        
        {/* Definitions */}
        <defs>
          {/* SVG Filter Definitions */}
          {svgFilters.map(filter => (
            <filter key={filter.id} id={filter.id}>
              {filter.type === 'gaussianBlur' && (
                <feGaussianBlur stdDeviation={filter.props.stdDeviation} />
              )}
              {filter.type === 'turbulence' && (
                <feTurbulence
                  type={filter.props.type}
                  baseFrequency={filter.props.baseFrequency}
                  numOctaves={filter.props.numOctaves}
                  seed={filter.props.seed}
                />
              )}
              {filter.type === 'displacement' && (
                <>
                  <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence" />
                  <feDisplacementMap
                    in2="turbulence"
                    in="SourceGraphic"
                    scale={filter.props.scale}
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </>
              )}
            </filter>
          ))}

          {/* SVG Gradient Definitions */}
          {svgGradients.map(gradient => (
            gradient.type === 'linear' ? (
              <linearGradient
                key={gradient.id}
                id={gradient.id}
                x1={gradient.props.x1}
                y1={gradient.props.y1}
                x2={gradient.props.x2}
                y2={gradient.props.y2}
              >
                {gradient.stops.map((stop, i) => (
                  <stop
                    key={i}
                    offset={`${stop.offset}%`}
                    stopColor={stop.color}
                    stopOpacity={stop.opacity}
                  />
                ))}
              </linearGradient>
            ) : (
              <radialGradient
                key={gradient.id}
                id={gradient.id}
                cx={gradient.props.cx}
                cy={gradient.props.cy}
                r={gradient.props.r}
                fx={gradient.props.fx}
                fy={gradient.props.fy}
              >
                {gradient.stops.map((stop, i) => (
                  <stop
                    key={i}
                    offset={`${stop.offset}%`}
                    stopColor={stop.color}
                    stopOpacity={stop.opacity}
                  />
                ))}
              </radialGradient>
            )
          ))}
        </defs>

        {/* Elements */}
        {renderElements()}

        {/* Animation Elements */}
        {previewAnimation && animations.map(anim => {
          if (anim.type === 'rotate') {
            return (
              <animateTransform
                key={anim.id}
                xlinkHref={`#${anim.elementId}`}
                attributeName="transform"
                type="rotate"
                from={`${anim.from} ${anim.cx || 0} ${anim.cy || 0}`}
                to={`${anim.to} ${anim.cx || 0} ${anim.cy || 0}`}
                dur={`${anim.dur}s`}
                repeatCount={anim.repeatCount}
                begin={anim.beginTime ? `${anim.beginTime}s` : "0s"}
              />
            );
          } else if (anim.type === 'scale') {
            return (
              <animateTransform
                key={anim.id}
                xlinkHref={`#${anim.elementId}`}
                attributeName="transform"
                type="scale"
                from={anim.from}
                to={anim.to}
                dur={`${anim.dur}s`}
                repeatCount={anim.repeatCount}
                begin={anim.beginTime ? `${anim.beginTime}s` : "0s"}
              />
            );
          } else if (anim.type === 'colorShift') {
            return (
              <animate
                key={anim.id}
                xlinkHref={`#${anim.elementId}`}
                attributeName={anim.attributeName}
                values={anim.values}
                dur={`${anim.dur}s`}
                repeatCount={anim.repeatCount}
                begin={anim.beginTime ? `${anim.beginTime}s` : "0s"}
              />
            );
          } else if (anim.type === 'motion' && anim.values) {
            return (
              <animate
                key={anim.id}
                xlinkHref={`#${anim.elementId}`}
                attributeName={anim.attributeName}
                values={anim.values}
                keyTimes={anim.keyTimes}
                dur={`${anim.dur}s`}
                repeatCount={anim.repeatCount}
                begin={anim.beginTime ? `${anim.beginTime}s` : "0s"}
              />
            );
          } else if (anim.type === 'attribute') {
            return (
              <animate
                key={anim.id}
                xlinkHref={`#${anim.elementId}`}
                attributeName={anim.attributeName}
                from={anim.from}
                to={anim.to}
                dur={`${anim.dur}s`}
                repeatCount={anim.repeatCount}
                begin={anim.beginTime ? `${anim.beginTime}s` : "0s"}
              />
            );
          }
          return null;
        })}
        
        {/* Drawing path preview */}
        {isDrawing && (
          <path
            d={drawingPath}
            fill="none"
            stroke="red"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
        
        {/* Selection and resize handles */}
        {renderResizeHandles()}
      </svg>
      
      {/* Text input overlay for creating text elements */}
      {showTextInput && (
        <div
          className="absolute bg-white border shadow p-2"
          style={{
            left: textPosition.x,
            top: textPosition.y,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left'
          }}
        >
          <input
            ref={textInputRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextInputComplete();
              } else if (e.key === 'Escape') {
                setShowTextInput(false);
                setTextInput("");
              }
            }}
            onBlur={handleTextInputComplete}
            className="border p-1"
            autoFocus
          />
        </div>
      )}
    </div>
    
    {/* Filter Panel */}
    {showFilterPanel && (
      <div className="absolute top-20 right-4 w-96 bg-white border shadow-lg rounded-lg p-4 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">SVG Filters</h3>
          <button 
            className="text-gray-500 hover:text-gray-700" 
            onClick={() => setShowFilterPanel(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <button 
            className="px-3 py-1 rounded bg-blue-500 text-white"
            onClick={() => {
              const newFilter = {
                id: `filter-${Date.now()}`,
                type: 'gaussianBlur',
                props: { stdDeviation: 5 },
                name: `Blur ${svgFilters.length + 1}`
              };
              setSvgFilters([...svgFilters, newFilter]);
              setSelectedFilterId(newFilter.id);
            }}
          >
            Add Gaussian Blur
          </button>
          <button 
            className="px-3 py-1 rounded bg-blue-500 text-white ml-2"
            onClick={() => {
              const newFilter = {
                id: `filter-${Date.now()}`,
                type: 'turbulence',
                props: { 
                  type: 'fractalNoise',
                  baseFrequency: 0.01,
                  numOctaves: 3,
                  seed: Math.floor(Math.random() * 100)
                },
                name: `Noise ${svgFilters.length + 1}`
              };
              setSvgFilters([...svgFilters, newFilter]);
              setSelectedFilterId(newFilter.id);
            }}
          >
            Add Turbulence
          </button>
          <button 
            className="px-3 py-1 rounded bg-blue-500 text-white ml-2"
            onClick={() => {
              const newFilter = {
                id: `filter-${Date.now()}`,
                type: 'displacement',
                props: { 
                  scale: 20,
                  in: 'SourceGraphic'
                },
                name: `Displacement ${svgFilters.length + 1}`
              };
              setSvgFilters([...svgFilters, newFilter]);
              setSelectedFilterId(newFilter.id);
            }}
          >
            Add Displacement
          </button>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Your Filters:</h4>
          {svgFilters.length === 0 ? (
            <p className="text-gray-500">No filters created yet</p>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {svgFilters.map(filter => (
                <div 
                  key={filter.id}
                  className={`p-2 mb-1 cursor-pointer rounded ${selectedFilterId === filter.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedFilterId(filter.id)}
                >
                  {filter.name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedFilterId && (
          <div>
            <h4 className="font-semibold mb-2">Edit Filter Properties:</h4>
            <div className="space-y-2">
              {(() => {
                const filter = svgFilters.find(f => f.id === selectedFilterId);
                if (!filter) return null;
                
                switch (filter.type) {
                  case 'gaussianBlur':
                    return (
                      <div className="flex items-center">
                        <label className="w-32">Blur Amount:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="20" 
                          value={filter.props.stdDeviation} 
                          onChange={e => {
                            const newFilters = [...svgFilters];
                            const index = newFilters.findIndex(f => f.id === selectedFilterId);
                            newFilters[index] = {
                              ...newFilters[index],
                              props: { ...newFilters[index].props, stdDeviation: Number(e.target.value) }
                            };
                            setSvgFilters(newFilters);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2">{filter.props.stdDeviation}</span>
                      </div>
                    );
                  case 'turbulence':
                    return (
                      <>
                        <div className="flex items-center">
                          <label className="w-32">Type:</label>
                          <select
                            value={filter.props.type}
                            onChange={e => {
                              const newFilters = [...svgFilters];
                              const index = newFilters.findIndex(f => f.id === selectedFilterId);
                              newFilters[index] = {
                                ...newFilters[index],
                                props: { ...newFilters[index].props, type: e.target.value }
                              };
                              setSvgFilters(newFilters);
                            }}
                            className="flex-grow p-1 border rounded"
                          >
                            <option value="fractalNoise">Fractal Noise</option>
                            <option value="turbulence">Turbulence</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-32">Frequency:</label>
                          <input 
                            type="range" 
                            min="0.001" 
                            max="0.5" 
                            step="0.001"
                            value={filter.props.baseFrequency} 
                            onChange={e => {
                              const newFilters = [...svgFilters];
                              const index = newFilters.findIndex(f => f.id === selectedFilterId);
                              newFilters[index] = {
                                ...newFilters[index],
                                props: { ...newFilters[index].props, baseFrequency: Number(e.target.value) }
                              };
                              setSvgFilters(newFilters);
                            }}
                            className="flex-grow"
                          />
                          <span className="ml-2">{filter.props.baseFrequency.toFixed(3)}</span>
                        </div>
                        <div className="flex items-center">
                          <label className="w-32">Octaves:</label>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={filter.props.numOctaves} 
                            onChange={e => {
                              const newFilters = [...svgFilters];
                              const index = newFilters.findIndex(f => f.id === selectedFilterId);
                              newFilters[index] = {
                                ...newFilters[index],
                                props: { ...newFilters[index].props, numOctaves: Number(e.target.value) }
                              };
                              setSvgFilters(newFilters);
                            }}
                            className="flex-grow"
                          />
                          <span className="ml-2">{filter.props.numOctaves}</span>
                        </div>
                      </>
                    );
                  case 'displacement':
                    return (
                      <div className="flex items-center">
                        <label className="w-32">Scale:</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          value={filter.props.scale} 
                          onChange={e => {
                            const newFilters = [...svgFilters];
                            const index = newFilters.findIndex(f => f.id === selectedFilterId);
                            newFilters[index] = {
                              ...newFilters[index],
                              props: { ...newFilters[index].props, scale: Number(e.target.value) }
                            };
                            setSvgFilters(newFilters);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2">{filter.props.scale}</span>
                      </div>
                    );
                  default:
                    return null;
                }
              })()}
            </div>
            
            <div className="mt-4">
              <button
                className="px-3 py-1 rounded bg-green-500 text-white"
                onClick={() => {
                  if (selectedElement) {
                    const newElements = [...elements];
                    const index = newElements.findIndex(el => el.id === selectedElement.id);
                    if (index !== -1) {
                      newElements[index] = { 
                        ...newElements[index], 
                        filter: selectedFilterId 
                      };
                      setElements(newElements);
                      setSelectedElement(newElements[index]);
                    }
                  }
                }}
                disabled={!selectedElement}
              >
                Apply to Selected Element
              </button>
              <button
                className="px-3 py-1 rounded bg-red-500 text-white ml-2"
                onClick={() => {
                  setSvgFilters(svgFilters.filter(f => f.id !== selectedFilterId));
                  setSelectedFilterId(null);
                }}
              >
                Delete Filter
              </button>
            </div>
          </div>
        )}
      </div>
    )}
    
    {/* Gradient Panel */}
    {showGradientPanel && (
      <div className="absolute top-20 right-4 w-96 bg-white text-gray-900 border shadow-lg rounded-lg p-4 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">SVG Gradients</h3>
          <button 
            className="text-gray-500 hover:text-gray-700" 
            onClick={() => setShowGradientPanel(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <button 
            className="px-3 py-1 rounded bg-blue-500 text-white"
            onClick={() => {
              const newGradient = {
                id: `gradient-${Date.now()}`,
                type: 'linear',
                props: { x1: 0, y1: 0, x2: 1, y2: 0 },
                stops: [
                  { offset: 0, color: '#ff0000', opacity: 1 },
                  { offset: 100, color: '#0000ff', opacity: 1 }
                ],
                name: `Linear ${svgGradients.length + 1}`
              };
              setSvgGradients([...svgGradients, newGradient]);
              setSelectedGradientId(newGradient.id);
            }}
          >
            Add Linear Gradient
          </button>
          <button 
            className="px-3 py-1 rounded bg-blue-500 text-white ml-2"
            onClick={() => {
              const newGradient = {
                id: `gradient-${Date.now()}`,
                type: 'radial',
                props: { cx: 0.5, cy: 0.5, r: 0.5, fx: 0.5, fy: 0.5 },
                stops: [
                  { offset: 0, color: '#ff0000', opacity: 1 },
                  { offset: 100, color: '#0000ff', opacity: 1 }
                ],
                name: `Radial ${svgGradients.length + 1}`
              };
              setSvgGradients([...svgGradients, newGradient]);
              setSelectedGradientId(newGradient.id);
            }}
          >
            Add Radial Gradient
          </button>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Your Gradients:</h4>
          {svgGradients.length === 0 ? (
            <p className="text-gray-500">No gradients created yet</p>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {svgGradients.map(gradient => (
                <div 
                  key={gradient.id}
                  className={`p-2 mb-1 cursor-pointer rounded ${selectedGradientId === gradient.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedGradientId(gradient.id)}
                >
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 mr-2 rounded border"
                      style={{
                        background: gradient.type === 'linear'
                          ? `linear-gradient(to right, ${gradient.stops.map(s => s.color).join(', ')})`
                          : `radial-gradient(circle, ${gradient.stops.map(s => s.color).join(', ')})`
                      }}
                    ></div>
                    {gradient.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedGradientId && (
          <div>
            <h4 className="font-semibold mb-2">Edit Gradient Properties:</h4>
            
            {(() => {
              const gradient = svgGradients.find(g => g.id === selectedGradientId);
              if (!gradient) return null;
              
              return (
                <>
                  {gradient.type === 'linear' ? (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center">
                        <label className="w-16">Start X:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={gradient.props.x1} 
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, x1: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.x1.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <label className="w-16">Start Y:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={gradient.props.y1} 
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, y1: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.y1.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <label className="w-16">End X:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={gradient.props.x2} 
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, x2: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.x2.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <label className="w-16">End Y:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={gradient.props.y2} 
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, y2: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.y2.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center">
                        <label className="w-16">Center X:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={gradient.props.cx} 
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, cx: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.cx.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <label className="w-16">Center Y:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={gradient.props.cy} 
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, cy: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.cy.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <label className="w-16">Radius:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={gradient.props.r} 
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, r: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.r.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <label className="w-16">Focus X:</label>
                        <input 
                          type="range" 
                          min="0"
                          max="1"
                          step="0.01"
                          value={gradient.props.fx}
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, fx: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.fx?.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <label className="w-16">Focus Y:</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={gradient.props.fy}
                          onChange={e => {
                            const newGradients = [...svgGradients];
                            const index = newGradients.findIndex(g => g.id === selectedGradientId);
                            newGradients[index] = {
                              ...newGradients[index],
                              props: { ...newGradients[index].props, fy: Number(e.target.value) }
                            };
                            setSvgGradients(newGradients);
                          }}
                          className="flex-grow"
                        />
                        <span className="ml-2 w-12">{gradient.props.fy?.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </>
              );
            })}
          </div>
        )}
      </div>
      )}

<>
      {showAnimationPanel && (
        <div className="absolute top-20 right-4 w-96 bg-white border shadow-lg rounded-lg p-4 z-10 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">SVG Animations</h3>
            <button 
              className="text-gray-300 hover:text-gray-700" 
              onClick={() => setShowAnimationPanel(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <button 
              className="px-3 py-1 rounded bg-blue-500 text-white"
              onClick={() => {
                if (!selectedElement) return;
                
                const newAnimation = {
                  id: `anim-${Date.now()}`,
                  elementId: selectedElement.id,
                  type: 'rotate',
                  attributeName: 'transform',
                  from: 0,
                  to: 360,
                  dur: 3, // seconds
                  repeatCount: 'indefinite',
                  name: `Rotation ${animations.length + 1}`
                };
                setAnimations([...animations, newAnimation]);
                setSelectedAnimationId(newAnimation.id);
              }}
              disabled={!selectedElement}
            >
              Add Rotation
            </button>
            <button 
              className="px-3 py-1 rounded bg-blue-500 text-white ml-2"
              onClick={() => {
                if (!selectedElement) return;
                
                const newAnimation = {
                  id: `anim-${Date.now()}`,
                  elementId: selectedElement.id,
                  type: 'scale',
                  attributeName: 'transform',
                  from: 1,
                  to: 1.5,
                  dur: 2, // seconds
                  repeatCount: 'indefinite',
                  name: `Scale ${animations.length + 1}`
                };
                setAnimations([...animations, newAnimation]);
                setSelectedAnimationId(newAnimation.id);
              }}
              disabled={!selectedElement}
            >
              Add Scale
            </button>
            <button 
              className="px-3 py-1 rounded bg-blue-500 text-white ml-2 mt-2"
              onClick={() => {
                if (!selectedElement) return;
                
                // Determine which attribute to animate based on element type
                let attributeName;
                let fromValue = 0;
                let toValue = 1;
                
                switch (selectedElement.type) {
                  case 'rect':
                    attributeName = 'width';
                    fromValue = selectedElement.width * 0.5;
                    toValue = selectedElement.width * 1.5;
                    break;
                  case 'circle':
                    attributeName = 'r';
                    fromValue = selectedElement.r * 0.5;
                    toValue = selectedElement.r * 1.5;
                    break;
                  case 'ellipse':
                    attributeName = 'rx';
                    fromValue = selectedElement.rx * 0.5;
                    toValue = selectedElement.rx * 1.5;
                    break;
                  case 'path':
                    attributeName = 'stroke-dashoffset';
                    // Set the element's stroke-dasharray if not set
                    if (!selectedElement.strokeDasharray) {
                      const newElements = [...elements];
                      const index = newElements.findIndex(el => el.id === selectedElement.id);
                      if (index !== -1) {
                        newElements[index] = { 
                          ...newElements[index], 
                          strokeDasharray: '20,10'
                        };
                        setElements(newElements);
                        setSelectedElement(newElements[index]);
                      }
                    }
                    fromValue = 0;
                    toValue = 30;
                    break;
                  default:
                    attributeName = 'opacity';
                    fromValue = 0.2;
                    toValue = 1;
                }
                
                const newAnimation = {
                  id: `anim-${Date.now()}`,
                  elementId: selectedElement.id,
                  type: 'attribute',
                  attributeName,
                  from: fromValue,
                  to: toValue,
                  dur: 1.5, // seconds
                  repeatCount: 'indefinite',
                  name: `${attributeName.charAt(0).toUpperCase() + attributeName.slice(1)} Anim ${animations.length + 1}`
                };
                setAnimations([...animations, newAnimation]);
                setSelectedAnimationId(newAnimation.id);
              }}
              disabled={!selectedElement}
            >
              Add Attribute Animation
            </button>
            <button 
              className="px-3 py-1 rounded bg-blue-500 text-white ml-2 mt-2"
              onClick={() => {
                if (!selectedElement) return;
                
                const newAnimation = {
                  id: `anim-${Date.now()}`,
                  elementId: selectedElement.id,
                  type: 'colorShift',
                  attributeName: 'fill',
                  values: '#ff0000;#00ff00;#0000ff;#ff0000',
                  dur: 4, // seconds
                  repeatCount: 'indefinite',
                  name: `Color Shift ${animations.length + 1}`
                };
                setAnimations([...animations, newAnimation]);
                setSelectedAnimationId(newAnimation.id);
              }}
              disabled={!selectedElement}
            >
              Add Color Shift
            </button>
            <button 
              className="px-3 py-1 rounded bg-blue-500 text-white ml-2 mt-2"
              onClick={() => {
                if (!selectedElement) return;
                
                const newAnimation = {
                  id: `anim-${Date.now()}`,
                  elementId: selectedElement.id,
                  type: 'motion',
                  attributeName: 'd',
                  path: selectedElement.type === 'path' ? selectedElement.d : null,
                  keyTimes: '0;0.25;0.5;0.75;1',
                  values: selectedElement.type === 'path' 
                    ? generatePathVariations(selectedElement.d, 5)
                    : null,
                  dur: 5, // seconds
                  repeatCount: 'indefinite',
                  name: `Path Morph ${animations.length + 1}`
                };
                setAnimations([...animations, newAnimation]);
                setSelectedAnimationId(newAnimation.id);
              }}
              disabled={!(selectedElement && selectedElement.type === 'path')}
            >
              Path Morph
            </button>
          </div>
          
          <div className="mb-4 text-gray-900">
            <h4 className="font-semibold mb-2">Your Animations:</h4>
            {animations.length === 0 ? (
              <p className="text-gray-500">No animations created yet</p>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                {animations.map(anim => {
                  // Find the element this animation applies to
                  const element = elements.find(el => el.id === anim.elementId);
                  
                  return (
                    <div 
                      key={anim.id}
                      className={`p-2 mb-1 cursor-pointer rounded ${selectedAnimationId === anim.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedAnimationId(anim.id)}
                    >
                      {anim.name}{' '}
                      {element ? `(${element.type})` : '(Element deleted)'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {selectedAnimationId && (
            <div className="text-gray-900">
              <h4 className="font-semibold mb-2">Edit Animation Properties:</h4>
              {(() => {
                const anim = animations.find(a => a.id === selectedAnimationId);
                if (!anim) return null;
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <label className="w-32">Duration (s):</label>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="10" 
                        step="0.1"
                        value={anim.dur} 
                        onChange={e => {
                          const newAnimations = [...animations];
                          const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                          newAnimations[index] = {
                            ...newAnimations[index],
                            dur: Number(e.target.value)
                          };
                          setAnimations(newAnimations);
                        }}
                        className="flex-grow"
                      />
                      <span className="ml-2 w-12">{anim.dur}s</span>
                    </div>
                    
                    <div className="flex items-center">
                      <label className="w-32">Repeat:</label>
                      <select
                        value={anim.repeatCount}
                        onChange={e => {
                          const newAnimations = [...animations];
                          const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                          newAnimations[index] = {
                            ...newAnimations[index],
                            repeatCount: e.target.value
                          };
                          setAnimations(newAnimations);
                        }}
                        className="flex-grow p-1 border rounded"
                      >
                        <option value="1">Once</option>
                        <option value="2">Twice</option>
                        <option value="5">5 times</option>
                        <option value="indefinite">Indefinite</option>
                      </select>
                    </div>
                    
                    {/* Animation delay */}
                    <div className="flex items-center">
                      <label className="w-32">Delay (s):</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.1"
                        value={anim.beginTime || 0} 
                        onChange={e => {
                          const newAnimations = [...animations];
                          const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                          newAnimations[index] = {
                            ...newAnimations[index],
                            beginTime: Number(e.target.value)
                          };
                          setAnimations(newAnimations);
                        }}
                        className="flex-grow"
                      />
                      <span className="ml-2 w-12">{anim.beginTime || 0}s</span>
                    </div>
                    
                    {/* Animation-specific properties */}
                    {anim.type === 'rotate' && (
                      <>
                        <div className="flex items-center">
                          <label className="w-32">From Angle:</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={anim.from} 
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                from: Number(e.target.value)
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow"
                          />
                          <span className="ml-2 w-12">{anim.from}°</span>
                        </div>
                        <div className="flex items-center">
                          <label className="w-32">To Angle:</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={anim.to} 
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                to: Number(e.target.value)
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow"
                          />
                          <span className="ml-2 w-12">{anim.to}°</span>
                        </div>
                      </>
                    )}
                    
                    {anim.type === 'scale' && (
                      <>
                        <div className="flex items-center">
                          <label className="w-32">From Scale:</label>
                          <input 
                            type="range" 
                            min="0.1" 
                            max="3" 
                            step="0.1"
                            value={anim.from} 
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                from: Number(e.target.value)
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow"
                          />
                          <span className="ml-2 w-12">{anim.from}x</span>
                        </div>
                        <div className="flex items-center">
                          <label className="w-32">To Scale:</label>
                          <input 
                            type="range" 
                            min="0.1" 
                            max="3" 
                            step="0.1"
                            value={anim.to} 
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                to: Number(e.target.value)
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow"
                          />
                          <span className="ml-2 w-12">{anim.to}x</span>
                        </div>
                      </>
                    )}
                    
                    {anim.type === 'attribute' && (
                      <>
                        <div className="flex items-center">
                          <label className="w-32">Attribute:</label>
                          <select
                            value={anim.attributeName}
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                attributeName: e.target.value
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow p-1 border rounded"
                          >
                            <option value="opacity">Opacity</option>
                            <option value="width">Width</option>
                            <option value="height">Height</option>
                            <option value="r">Radius</option>
                            <option value="rx">RadiusX</option>
                            <option value="ry">RadiusY</option>
                            <option value="stroke-width">Stroke Width</option>
                            <option value="stroke-dashoffset">Dash Offset</option>
                          </select>
                        </div>
                        <div className="flex items-center">
                          <label className="w-32">From Value:</label>
                          <input 
                            type="number" 
                            min="0" 
                            max={anim.attributeName === 'opacity' ? 1 : 100}
                            step={anim.attributeName === 'opacity' ? 0.1 : 1}
                            value={anim.from} 
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                from: Number(e.target.value)
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow p-1 border rounded"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="w-32">To Value:</label>
                          <input 
                            type="number" 
                            min="0" 
                            max={anim.attributeName === 'opacity' ? 1 : 100}
                            step={anim.attributeName === 'opacity' ? 0.1 : 1}
                            value={anim.to} 
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                to: Number(e.target.value)
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow p-1 border rounded"
                          />
                        </div>
                      </>
                    )}
                    
                    {anim.type === 'colorShift' && (
                      <>
                        <div className="flex items-center">
                          <label className="w-32">Color Values:</label>
                          <div className="flex flex-grow flex-wrap gap-2">
                            {anim.values.split(';').map((color, i) => (
                              <div key={i} className="flex items-center">
                                <input 
                                  type="color" 
                                  value={color}
                                  onChange={e => {
                                    const newAnimations = [...animations];
                                    const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                                    const colors = newAnimations[index].values.split(';');
                                    colors[i] = e.target.value;
                                    newAnimations[index] = {
                                      ...newAnimations[index],
                                      values: colors.join(';')
                                    };
                                    setAnimations(newAnimations);
                                  }}
                                  className="w-8 h-8 p-0 border"
                                />
                              </div>
                            ))}
                            <button 
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                              onClick={() => {
                                const newAnimations = [...animations];
                                const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                                const colors = newAnimations[index].values.split(';');
                                // Add new random color
                                const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
                                colors.splice(colors.length-1, 0, randomColor);
                                newAnimations[index] = {
                                  ...newAnimations[index],
                                  values: colors.join(';')
                                };
                                setAnimations(newAnimations);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <label className="w-32">Apply to:</label>
                          <select
                            value={anim.attributeName}
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                attributeName: e.target.value
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow p-1 border rounded"
                          >
                            <option value="fill">Fill</option>
                            <option value="stroke">Stroke</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    {anim.type === 'motion' && anim.path && (
                      <>
                        <div className="flex items-center">
                          <label className="w-32">Motion Type:</label>
                          <select
                            value={anim.motionType || 'morph'}
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              newAnimations[index] = {
                                ...newAnimations[index],
                                motionType: e.target.value
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow p-1 border rounded"
                          >
                            <option value="morph">Path Morphing</option>
                            <option value="jitter">Jitter Effect</option>
                            <option value="wave">Wave Effect</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <label className="w-32">Intensity:</label>
                          <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={anim.intensity || 5} 
                            onChange={e => {
                              const newAnimations = [...animations];
                              const index = newAnimations.findIndex(a => a.id === selectedAnimationId);
                              const intensity = Number(e.target.value);
                              
                              // Regenerate path variations based on intensity
                              let pathVariations;
                              switch (anim.motionType || 'morph') {
                                case 'jitter':
                                  pathVariations = generateJitterPaths(anim.path, intensity, 5);
                                  break;
                                case 'wave':
                                  pathVariations = generateWavePaths(anim.path, intensity, 5);
                                  break;
                                default:
                                  pathVariations = generatePathVariations(anim.path, 5, intensity / 10);
                              }
                              
                              newAnimations[index] = {
                                ...newAnimations[index],
                                intensity: intensity,
                                values: pathVariations
                              };
                              setAnimations(newAnimations);
                            }}
                            className="flex-grow"
                          />
                          <span className="ml-2 w-12">{anim.intensity || 5}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
              
              <div className="mt-4">
                <button
                  className="px-3 py-1 rounded bg-red-500 text-white"
                  onClick={() => {
                    setAnimations(animations.filter(a => a.id !== selectedAnimationId));
                    setSelectedAnimationId(null);
                  }}
                >
                  Delete Animation
                </button>
                <button
                  className="px-3 py-1 rounded bg-blue-500 text-white ml-2"
                  onClick={() => setPreviewAnimation(!previewAnimation)}
                >
                  {previewAnimation ? 'Stop Preview' : 'Preview Animations'}
                </button>
                <button
                  className="px-3 py-1 rounded bg-green-500 text-white ml-2"
                  onClick={() => {
                    const anim = animations.find(a => a.id === selectedAnimationId);
                    if (!anim) return;

                    const element = elements.find(el => el.id === anim.elementId);
                    if (!element) return;

                    const newElements = [...elements];
                    const index = newElements.findIndex(el => el.id === element.id);
                    
                    if (!newElements[index].animations) {
                      newElements[index].animations = [];
                    }
                    // Create a new animation object with a unique ID
                    const appliedAnim = {
                      ...anim,
                      id: `applied-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                    };
                    newElements[index].animations.push(appliedAnim);
                    
                    setElements(newElements);
                    setSelectedElement(newElements[index]);
                  }}
                  disabled={!selectedAnimationId}
                >
                  Apply Animation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Animation Timer for previews */}
      {previewAnimation && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 border shadow rounded px-3 py-1 flex items-center z-10">
          <span>Animating</span>
          <button
            className="ml-3 px-2 py-1 rounded bg-red-500 text-white text-sm"
            onClick={() => setPreviewAnimation(false)}
          >
            Stop
          </button>
        </div>
      )}
    </>
    </div>
  );
}

export default SVGDragDropEditor;