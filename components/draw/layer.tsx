import {
  Group,
  ActionIcon,
  createStyles,
  Text,
  Title,
  Stack,
} from "@mantine/core";
import {
  IconGripVertical,
  IconX,
  IconCopy,
  IconStack2,
} from "@tabler/icons-react";
import {
  typeToIcon,
  addLayer,
  changeLayerIndex,
  removeLayerByIndex,
  setSelected,
} from "@/lib/drawSlice";
import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export function Layer() {
  // Provider
  const dispatch = useDispatch();
  const layer = useSelector((state: any) => state.draw.layer);
  const selected = useSelector((state: any) => state.draw.selected);

  const [hover, setHover] = useState(-1);

  const { classes, cx } = createStyles((theme) => ({
    item: {
      marginBottom: 2,
      fontSize: 12,
      borderRadius: theme.radius.sm,
      border: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[4]
      }`,
      padding: 2,
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,
    },

    isSelected: {
      borderColor: theme.colors.blue[6],
    },

    dragHandle: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingRight: 4,
      cursor: "grab",
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[6],
    },
  }))();
  const items = layer.map((item: any, index: any) => (
    <Draggable key={`layer-${item.name}`} draggableId={item.name} index={index}>
      {(provided: any, snapshot: any) => (
        <Group
          spacing={4}
          sx={(theme) => {
            return {
              borderColor: index === selected ? theme.colors.blue[6] : "",
            };
          }}
          className={cx(classes.item, {
            // [classes.itemDragging]: snapshot.isDragging,
          })}
          ref={provided.innerRef}
          onClick={() => dispatch(setSelected(index))}
          onMouseOver={() => setHover(index)}
          onMouseOut={() => setHover(-1)}
          {...provided.draggableProps}
        >
          <div {...provided.dragHandleProps} className={classes.dragHandle}>
            <IconGripVertical size={16} />
          </div>
          <Text size="xs" style={{ cursor: "default" }}>
            {item.name}
          </Text>

          {hover === index && (
            <ActionIcon
              size="xs"
              onClick={(event) => {
                event.stopPropagation();
                const existsNames = layer.map((l: any) => l.name);
                let name = layer[index].name;
                let num = 2;

                // Search tail (n)
                const match = name.match(/ \(\d+\)$/g);

                if (match) {
                  name = name.substring(0, name.length - match[0].length); // Remove tail (n)
                  num = Number(match[0].substring(2, match[0].length - 1)) + 1; // Get number
                }

                // Searching duplicate
                while (existsNames.includes(`${name} (${num})`)) num++;

                // Set layer and layer name
                dispatch(
                  addLayer({ ...layer[index], name: `${name} (${num})` })
                );
              }}
            >
              <IconCopy />
            </ActionIcon>
          )}
          <Group
            sx={(theme) => {
              return {
                width: 18,
                height: 18,
                marginLeft: "auto",
                alignContent: "center",
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.gray[7]
                    : theme.colors.gray[4],
              };
            }}
          >
            {typeToIcon(item.type)}
          </Group>
          <ActionIcon
            size="xs"
            onClick={(event) => {
              event.stopPropagation();
              dispatch(removeLayerByIndex(index));
            }}
          >
            <IconX />
          </ActionIcon>
        </Group>
      )}
    </Draggable>
  ));

  return (
    <Stack>
      <Group position="center">
        <IconStack2 />
        <Title order={5}>Layer</Title>
      </Group>
      <DragDropContext
        onDragEnd={({ destination, source }: any) => {
          if (!destination) return;
          dispatch(
            changeLayerIndex({ from: source.index, to: destination.index })
          );

          // Change selected index when selected element move
          if (selected === source.index)
            dispatch(setSelected(destination.index));
          // Change selected index when other move
          else if (source.index < selected && destination.index >= selected)
            dispatch(setSelected(selected - 1));
          else if (source.index > selected && destination.index <= selected)
            dispatch(setSelected(selected + 1));
        }}
      >
        <Droppable droppableId="layer" direction="vertical">
          {(provided: any) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Stack>
  );
}
