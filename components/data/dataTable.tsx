import { useMantineTheme, Table } from "@mantine/core";
import { useState, useRef, forwardRef, createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { FixedSizeList } from "react-window";
import { containerHeight } from "@/lib/paperSlice";

export function DataTable() {
  const data = useSelector((state: any) => state.data.value);
  const rowHeight = 32;
  const keys: string[] = [];
  if (data.length) for (let key of Object.keys(data[0])) keys.push(key);

  const theme = useMantineTheme();

  /** Context for cross component communication */
  const VirtualTableContext = createContext({
    top: 0,
    setTop: (value: any) => {},
    header: <></>,
    footer: <></>,
  });
  /** The virtual table. It basically accepts all of the same params as the original FixedSizeList.*/
  function VirtualTable({ row, header, footer, ...rest }: any) {
    const listRef: any = useRef();
    const [top, setTop] = useState(0);

    return (
      <VirtualTableContext.Provider value={{ top, setTop, header, footer }}>
        <FixedSizeList
          {...rest}
          innerElementType={Inner}
          onItemsRendered={(props) => {
            const style =
              listRef.current &&
              // @ts-ignore private method access
              listRef.current._getItemStyle(props.overscanStartIndex);
            setTop((style && style.top) || 0);

            // Call the original callback
            rest.onItemsRendered && rest.onItemsRendered(props);
          }}
          ref={(el) => (listRef.current = el)}
        >
          {row}
        </FixedSizeList>
      </VirtualTableContext.Provider>
    );
  }
  /** The Row component. This should be a table row, and noted that we don't use the style that regular `react-window` examples pass in.*/
  function Row({ index }: any) {
    return (
      <tr
        style={
          index % 2
            ? {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              }
            : undefined
        }
      >
        {/** Make sure your table rows are the same height as what you passed into the list... */}
        <td
          style={{
            fontWeight: "bold",
            color: theme.colors.gray[theme.colorScheme === "dark" ? 7 : 5],
          }}
        >
          {index}
        </td>
        {keys.map((k, j) => (
          <td style={{ height: rowHeight }} key={`td-${index}-${j}`}>
            {data[index][k]}
          </td>
        ))}
      </tr>
    );
  }
  /**
   * The Inner component of the virtual list. This is the "Magic".
   * Capture what would have been the top elements position and apply it to the table.
   * Other than that, render an optional header and footer.
   **/
  const Inner = forwardRef(function Inner({ children, ...rest }: any, ref) {
    const { header, footer, top } = useContext(VirtualTableContext);
    return (
      <div {...rest} ref={ref}>
        <Table
          fontSize="xs"
          style={{ top, position: "absolute", whiteSpace: "nowrap" }}
        >
          {header}
          <tbody>{children}</tbody>
          {footer}
        </Table>
      </div>
    );
  });

  return (
    <VirtualTable
      height={containerHeight() - 30}
      itemCount={data.length}
      itemSize={rowHeight}
      header={
        <thead>
          <tr>
            <th>#</th>
            {keys.map((k, i) => (
              <th key={`th-${i}`}>{k}</th>
            ))}
          </tr>
        </thead>
      }
      row={Row}
      footer={<></>}
    />
  );
}
