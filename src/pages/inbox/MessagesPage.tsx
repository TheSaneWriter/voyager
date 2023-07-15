import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useEffect, useMemo, useState } from "react";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import { jwtPayloadSelector } from "../../features/auth/authSlice";
import ConversationItem from "../../features/inbox/messages/ConversationItem";
import { MaxWidthContainer } from "../../features/shared/AppContent";
import {
  conversationsByPersonIdSelector,
  syncMessages,
} from "../../features/inbox/inboxSlice";
import ComposeButton from "./ComposeButton";
import { CenteredSpinner } from "../posts/PostPage";

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.inbox.messages);
  const jwtPayload = useAppSelector(jwtPayloadSelector);
  const [loading, setLoading] = useState(false);
  const conversationsByPersonId = useAppSelector(
    conversationsByPersonIdSelector
  );

  const groupedConversations = useMemo(
    () => Object.values(conversationsByPersonId),
    [conversationsByPersonId]
  );

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, jwtPayload]);

  async function fetchItems() {
    setLoading(true);
    try {
      await dispatch(syncMessages());
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>Messages</IonTitle>

          <IonButtons slot="end">
            <MarkAllAsReadButton />
            <ComposeButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            try {
              await dispatch(syncMessages());
            } finally {
              e.detail.complete();
            }
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        {!messages.length && loading ? (
          <CenteredSpinner />
        ) : (
          <MaxWidthContainer>
            <IonList>
              {groupedConversations.map((conversationMessages, index) => (
                <ConversationItem key={index} messages={conversationMessages} />
              ))}
            </IonList>
          </MaxWidthContainer>
        )}
      </IonContent>
    </IonPage>
  );
}
