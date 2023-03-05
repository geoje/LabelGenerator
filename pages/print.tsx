import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { HeaderSimple } from "@/components/header";
import { defaultLocale } from "@/lib/tool";
import Head from "next/head";
import { Grid } from "@mantine/core";
import { Control } from "@/components/print/control";
import { Preview } from "@/components/print/preview";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? defaultLocale, ["common"])),
  },
});

export default function Template() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("Print") + " - " + t("Label Generator")}</title>
      </Head>
      <HeaderSimple />
      <Grid m={0} p="sm" pt="xl">
        <Grid.Col md={3} orderMd={1}>
          <Control />
        </Grid.Col>
        <Grid.Col md={9} orderMd={0}>
          <Preview />
        </Grid.Col>
      </Grid>
    </>
  );
}
