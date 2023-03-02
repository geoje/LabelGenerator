import { Slider } from "@mantine/core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPage } from "@/lib/drawSlice";

export function Pagenation() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.data.value);
  const page = useSelector((state: any) => state.draw.page);

  const qLength = data.length / 4;

  return data?.length ? (
    <>
      <Slider
        size="xs"
        style={{ maxWidth: "100%", width: data.length }}
        label={"# " + page}
        disabled={!data.length}
        defaultValue={0}
        value={page}
        min={0}
        max={data.length - 1}
        step={1}
        marks={[
          {
            value: Math.floor(qLength),
            label: "# " + Math.floor(qLength),
          },
          {
            value: Math.floor(data.length / 2),
            label: "# " + Math.floor(data.length / 2),
          },
          {
            value: Math.floor(qLength * 3),
            label: "# " + Math.floor(qLength * 3),
          },
        ]}
        onChange={(value) => dispatch(setPage(value))}
      />
    </>
  ) : (
    <></>
  );
}
