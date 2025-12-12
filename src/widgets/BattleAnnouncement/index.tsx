import { useAppSelector } from "@/states";
import { useAnnouncementAnimation } from "./useAnnouncementAnimation";
import { AnnouncementOverlay } from "./AnnouncementOverlay";
import { AnnouncementBackground } from "./AnnouncementBackground";
import { AnnouncementText } from "./AnnouncementText";

export function BattleAnnouncement() {
  const announcement = useAppSelector((state) => state.ui.battleAnnouncement);
  const { isFadingOut } = useAnnouncementAnimation(announcement);

  if (!announcement) {
    return null;
  }

  return (
    <AnnouncementOverlay isFadingOut={isFadingOut}>
      <AnnouncementBackground />
      <AnnouncementText
        text={announcement.text}
        subText={announcement.subText}
      />
    </AnnouncementOverlay>
  );
}
