import { RECOMMENDED_COUNT } from "@/lib/printSlice";
import {
  Group,
  Text,
  Modal,
  useMantineTheme,
  Button,
  Title,
  Loader,
  Alert,
  Code,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertTriangle, IconReceipt } from "@tabler/icons-react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

export function PrintModal({ qty, useCredit, opened, close, onAgree }: any) {
  const theme = useMantineTheme();
  const { t, i18n } = useTranslation();
  const [myCredit, setMyCredit]: any = useState();

  useEffect(() => {
    setMyCredit(undefined);
    axios
      .get(process.env.NEXT_PUBLIC_AUTH_HOST + "/api/payment/myCredit", {
        withCredentials: true,
      })
      .then((res) => res.data.credit)
      .then(setMyCredit)
      .catch(console.error);
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="auto"
      title={
        <Group>
          <Text color="blue">
            <IconReceipt size={48} />
          </Text>
          <Title order={4}>{t("Use credit")}</Title>
        </Group>
      }
      overlayColor={
        theme.colorScheme === "dark"
          ? theme.colors.dark[9]
          : theme.colors.gray[2]
      }
      overlayOpacity={0.55}
      overlayBlur={3}
    >
      {qty > RECOMMENDED_COUNT && (
        <Alert
          icon={<IconAlertTriangle size="1rem" />}
          title={t("Bulk Print Warning")}
          color="yellow"
        >
          <Text>
            {t("You tried to print")} <b>{qty.toLocaleString()}</b>{" "}
            {t("copies more than {0}").replace(
              "{0}",
              RECOMMENDED_COUNT.toLocaleString()
            )}
          </Text>
          <Text>
            {t(
              "It causes the browser to freeze, but you can print after waiting for rendering"
            )}
          </Text>
        </Alert>
      )}
      <Group noWrap position="apart" mt="xl" h={60}>
        <Title pr={4} order={4}>
          {t("My credit")}
        </Title>
        {myCredit ? (
          <Code bg="transparent" fz="3em" lh={1.2} style={{ color: "#868E96" }}>
            {myCredit.toLocaleString(i18n.language)}
          </Code>
        ) : (
          <Loader size="xl" color="#868E96" />
        )}
      </Group>
      <Group noWrap position="apart" h={60}>
        <Title pr={4} order={4}>
          {t("Cost")}
        </Title>
        <Code bg="transparent" fz="3em" lh={1.2} style={{ color: "#228BE6" }}>
          -{useCredit.toLocaleString(i18n.language)}
        </Code>
      </Group>
      <Group noWrap position="apart" h={60}>
        <Title pr={4} order={4}>
          {t("Remain")}
        </Title>
        {myCredit ? (
          <Code
            bg="transparent"
            fz="3em"
            lh={1.2}
            style={{ color: myCredit - useCredit > 0 ? "#868E96" : "#FA5252" }}
          >
            ={(myCredit - useCredit).toLocaleString(i18n.language)}
          </Code>
        ) : (
          <Loader size="xl" color="#868E96" />
        )}
      </Group>

      <Group mt="xl" position="right">
        <Button
          disabled={!myCredit}
          onClick={async () => {
            axios(
              process.env.NEXT_PUBLIC_AUTH_HOST +
                "/api/payment/use?credit=" +
                useCredit,
              { withCredentials: true }
            )
              .then(onAgree)
              .catch((error) => {
                showNotification({
                  title: "Fail to use credit and print",
                  message: error.message,
                  color: "red",
                });
                console.error(error);
              });
          }}
        >
          {t("Use credit and print")}
        </Button>
      </Group>
    </Modal>
  );
}
