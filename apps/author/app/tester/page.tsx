"use client";

import { Button, Input } from "@kofile/gds-react";
import buttonStyles from "@kofile/gds-foundations/components/button.module.css";
import inputStyles from "@kofile/gds-foundations/components/input.module.css";

export default function Tester() {
  return (
    <div>
      <Input className={inputStyles.root}>
        <Input.TextField className={inputStyles.input} />
      </Input>

      <Button
        background="solid"
        variant="primary"
        className={buttonStyles.button}
      >
        Test
      </Button>
    </div>
  );
}
