import { useCallback, useState } from "react";
import BottomTabs, { type BottomTabsProps } from "@/components/BottomTabs";
import AccountAccessSheet from "@/components/AccountAccessSheet";
import { useAccountAccess } from "@/hooks/use-account-access";
import { useLang } from "@/contexts/LangContext";

/** All locked bottom tabs share the same contained mock account flow. */
const AccountBottomTabs = (props: BottomTabsProps) => {
  const { lang } = useLang();
  const access = useAccountAccess(props.isAuthed);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const attach = useCallback((element: HTMLDivElement | null) => {
    setContainer(element?.parentElement ?? null);
  }, []);

  return <>
    <div ref={attach} className="shrink-0">
      <BottomTabs {...props} onLogin={access.open} />
    </div>
    <AccountAccessSheet target={access.target} lang={lang} container={container} submitting={access.submitting} error={access.error} onClose={access.close} onContinue={access.continueWithEmail} onLogin={access.login} />
  </>;
};

export default AccountBottomTabs;