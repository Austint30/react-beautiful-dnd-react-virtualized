import ReactDOM from "react-dom";
import { List, AutoSizer } from "react-virtualized";
import React, { memo, useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const padding = 10;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const ListItem = memo((props) => {
  const { item, style, index, provided, isDragging } = props;

  // return (
  //   <div
  //     ref={provided.innerRef}
  //     {...provided.draggableProps}
  //     {...provided.dragHandleProps}
  //   >

  //   </div>
  // )

  return (
    <div
      data-index={index}
      data-testid={item.id}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      data-is-dragging={isDragging}
      style={{
        ...style,
        // display: "flex",
        // padding: "0 10px",
        // alignItems: "center",
        // boxSizing: "border-box",
        // marginBottom: `${padding}px`,
        ...provided.draggableProps.style
        // backgroundColor: props.isDragging ? "#ccc" : "#eee"
      }}
    >
      <MyItem>{item.content}</MyItem>
    </div>
  );
});

const MyItem = (props) => {
  return (
    <div
      {...props}
      style={{ backgroundColor: "grey", padding: "1rem", marginBottom: 3 }}
    />
  );
};

const rowRenderer = (items) => ({ index, style }) => {
  const item = items[index];

  if (!item) return null;

  console.log(style);

  const patchedStyle = {
    ...style
    // top: style.top + padding,
    // left: style.left + padding,
    // height: style.height - padding,
    // width: `calc(${style.width} - ${padding * 2}px)`
  };

  return (
    <Draggable index={index} key={item.id} draggableId={item.id}>
      {(provided, snapshot) => (
        <ListItem
          item={item}
          provided={provided}
          style={patchedStyle}
          isDragging={snapshot.isDragging}
        />
      )}
    </Draggable>
  );
};

const Column = memo(({ items, id }) => {
  return (
    <div style={{ display: "flex", flex: 1 }}>
      <Droppable
        mode="virtual"
        droppableId={id}
        renderClone={(provided, snapshot, rubric) => (
          <ListItem
            provided={provided}
            isDragging={snapshot.isDragging}
            item={items[rubric.source.index]}
          />
        )}
      >
        {(droppableProvided, snapshot) => {
          const itemCount = snapshot.isUsingPlaceholder
            ? items.length + 1
            : items.length;

          return (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  width={width}
                  height={height}
                  rowHeight={50}
                  rowCount={itemCount}
                  ref={(ref) => {
                    if (ref) {
                      // eslint-disable-next-line react/no-find-dom-node
                      const whatHasMyLifeComeTo = ReactDOM.findDOMNode(ref);
                      if (whatHasMyLifeComeTo instanceof window.HTMLElement) {
                        droppableProvided.innerRef(whatHasMyLifeComeTo);
                      }
                    }
                  }}
                  style={{
                    transition: "background-color 0.2s ease",
                    backgroundColor: snapshot.isDraggingOver
                      ? "#0a84e3"
                      : "#74b9ff"
                  }}
                  rowRenderer={rowRenderer(items)}
                />
              )}
            </AutoSizer>
          );
        }}
      </Droppable>
    </div>
  );
});

export default () => {
  const [items, setItems] = useState([]);
  const [items2, setItems2] = useState([]);

  useEffect(() => {
    const generateItems = new Array(2500).fill().map((value, id) => ({
      id: `id-${id}`,
      content: `content ${id}`
    }));
    setItems(generateItems);

    const generateItems2 = new Array(2500).fill().map((value, id) => ({
      id: `id-${id}-${id}`,
      content: `content ${id}-${id}`
    }));
    setItems2(generateItems2);
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    setItems(reorder(items, result.source.index, result.destination.index));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", height: "100vh" }}>
        <Column id="LEFT" items={items} />
        <Column id="RIGHT" items={items2} />
      </div>
    </DragDropContext>
  );
};
