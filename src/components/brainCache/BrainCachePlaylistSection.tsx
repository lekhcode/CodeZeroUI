import { useEffect, useState } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import type { BrainCachePlaylist } from "@/types/brainCache.types";
import { BrainCachePlaylistProblemsList } from "@/components/brainCache/BrainCachePlaylistProblemsList";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import panel from "@/components/RevisionPanel/RevisionPanel.module.css";
import styles from "@/components/brainCache/BrainCachePanel.module.css";

type BrainCachePlaylistSectionProps = {
  playlists: BrainCachePlaylist[];
  loading?: boolean;
  onDelete: (id: string) => void;
  deleting?: boolean;
};

export function BrainCachePlaylistSection({
  playlists,
  loading = false,
  onDelete,
  deleting = false,
}: BrainCachePlaylistSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (playlists.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId === null || !playlists.some((p) => p.id === selectedId)) {
      setSelectedId(playlists[0]!.id);
    }
  }, [playlists, selectedId]);

  const selected = playlists.find((p) => p.id === selectedId) ?? null;

  return (
    <section className={styles.block} aria-label="Your playlists">
      <div className={styles.blockHeader}>
        <h3 className={styles.blockTitle}>Your playlists</h3>
        <span className={styles.blockMeta}>{playlists.length} total</span>
      </div>

      {loading ? (
        <LoadingSkeleton variant="detail" />
      ) : playlists.length === 0 ? (
        <p className={panel.empty}>Your training journal is empty. Build your first playlist.</p>
      ) : (
        <div className={styles.playlistShell}>
          <div className={styles.playlistSidebar} role="listbox" aria-label="Playlist list">
            {playlists.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${styles.playlistItem} ${active ? styles.playlistItemActive : ""}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <span className={styles.playlistItemName}>{p.name}</span>
                  <span className={styles.playlistItemMeta}>
                    {p.problemCount} problems · every {p.revisionIntervalDays}d
                    {p.overdueCount > 0 ? ` · ${p.overdueCount} overdue` : ""}
                    {p.dueCount > 0 ? ` · ${p.dueCount} due` : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.playlistDetail}>
            {selected ? (
              <>
                <div className={styles.playlistDetailHeader}>
                  <div className={styles.playlistDetailText}>
                    <p className={styles.playlistDetailName}>{selected.name}</p>
                    <p className={styles.playlistDetailMeta}>
                      {selected.problemCount} problems · revise every {selected.revisionIntervalDays}{" "}
                      days
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    disabled={deleting}
                    onClick={() => onDelete(selected.id)}
                    aria-label="Delete playlist"
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
                <div className={`${styles.playlistProblems} app-scroll`}>
                  <BrainCachePlaylistProblemsList playlist={selected} />
                </div>
              </>
            ) : (
              <p className={panel.empty}>Select a playlist</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
