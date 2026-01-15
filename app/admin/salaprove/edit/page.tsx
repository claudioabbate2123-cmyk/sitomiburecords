import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

const EditClient = dynamicImport(() => import("./EditClient"), {
  ssr: false,
});

export default function Page() {
  return <EditClient />;
}

