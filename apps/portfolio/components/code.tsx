import React from "react";
import Refractor from "react-refractor";
import js from "refractor/lang/javascript";

Refractor.registerLanguage(js);

// @ts-expect-error TODO: fix this
export function Code(props) {
  return (
    <Refractor
      className="text-color-secondary grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3"
      language={props.language || "js"}
      value={props.value}
      markers={props.markers}
    />
  );
}
