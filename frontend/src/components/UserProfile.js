import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ArticleList from "./ArticleList";
import {
  fetchUserFollowers,
  fetchUserFollowing,
  followUser,
  unfollowUser,
  updateUserProfile
} from "../api";

/* Styled components (palette: blue/bright) */
const ProfileContainer = styled.div`
  background: var(--kavia-dark);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  margin: 0 auto 32px auto;
  max-width: 730px;
  min-height: 400px;
  padding: 39px 30px 24px 30px;
`;

const Avatar = styled.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid #90caf9;
  background: #e3f2fd;
  margin-right: 24px;
  object-fit: cover;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 7px;
`;

const BtnRow = styled.div`
  margin-top: 0;
  display: flex;
  gap: 10px;
`;

const NameField = styled.input`
  font-size: 1.22rem;
  padding: 7px 10px;
  border: 1.2px solid #90caf9;
  border-radius: 6px;
  margin-bottom: 4px;
  background: #f2faff;
  color: #1565c0;
  font-weight: 700;
`;

const Bio = styled.p`
  font-size: 1.07rem;
  color: #2196f3;
  margin-bottom: 4px;
`;

const BioEdit = styled.textarea`
  font-size: 1.05rem;
  padding: 7px 10px;
  border: 1.2px solid #90caf9;
  border-radius: 7px;
  background: #f2faff;
  color: #1565c0;
  min-height: 38px;
  margin-bottom: 6px;
`;

const AvatarEdit = styled.input`
  display: block;
  margin-bottom: 7px;
  font-size: 0.97rem;
`;

const SectionTitle = styled.h3`
  color: #1976d2;
  font-size: 1.1rem;
  margin-top: 30px;
  font-weight: 700;
`;

const CountLink = styled.span`
  color: #1976d2;
  background: #e3f2fd;
  border-radius: 12px;
  font-size: 1.01rem;
  padding: 4px 13px 2px 13px;
  margin-right: 8px;
  cursor: pointer;
  font-weight: 500;
  &:hover { background: #bbdefb; }
`;

const FollowBtn = styled.button`
  background: ${({following}) => following ? "#fff" : "#1976d2"};
  color: ${({following}) => following ? "#1976d2" : "#fff"};
  border: 1.2px solid #2196f3;
  border-radius: 8px;
  font-size: 1.04rem;
  padding: 6px 18px;
  font-weight: 700;
  margin-left: 8px;
  margin-top: 12px;
  min-width: 88px;
  cursor: pointer;
  transition: all 0.14s;
  &:hover {
    background: ${({following}) => following ? "#e3f2fd" : "#1565c0"};
  }
`;

const SaveBtn = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  font-weight: 600;
  padding: 7px 19px;
  font-size: 1.01rem;
  border-radius: 7px;
  margin-top: 10px;
`;

const CancelBtn = styled.button`
  background: #f5f5f5;
  color: #1976d2;
  border: 1.2px solid #1976d2;
  border-radius: 7px;
  padding: 7px 16px;
  font-weight: 600;
  font-size: 0.97rem;
  margin-left: 7px;
`;

const ListDialog = styled.div`
  background: #fff;
  color: #1565c0;
  border-radius: 12px;
  border: 2px solid #bbdefb;
  box-shadow: 0 4px 22px 0 rgba(25, 118, 210, 0.10);
  padding: 18px 22px 16px 22px;
  position: absolute;
  z-index: 9999;
  left: 50%;
  transform: translateX(-50%);
  max-width: 320px;
`;

const ListDialogTitle = styled.div`
  font-weight: 700;
  margin-bottom: 6px;
  color: #1976d2;
  font-size: 1.05rem;
`;

const ListDialogItem = styled.div`
  padding: 4px 0 4px 0;
  border-bottom: 1px solid #e3f2fd;
  font-size: 1.01rem;
  &:last-child { border-bottom: none;}
`;

/**
 * PUBLIC_INTERFACE
 * UserProfile component: Editable if myself, shows followers/following, follow/unfollow, blue palette
 */
export default function UserProfile({
  user,
  myArticles,
  tags,
  currentUser,     // Pass logged-in user (from useAuth)
  refreshProfile,  // Optionally: function to reload after edits
  allUsers         // Optionally: all users for mapping ids to names in followers/followings
}) {
  // Local state for editing
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || "");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [listOpen, setListOpen] = useState(null); // "followers" or "following"
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  // For mapping IDs to names
  const usersById = {};
  (allUsers || []).forEach(u => { usersById[u.id] = u; });

  const isMe = !!currentUser && user && currentUser.id === user.id;
  const isLoggedIn = !!currentUser;

  // Load followers/following info
  useEffect(() => {
    if (!user?.id) return;
    fetchUserFollowers(user.id).then(setFollowers);
    fetchUserFollowing(user.id).then(setFollowing);
  }, [user?.id]);

  // Reset edit form when switching users
  useEffect(() => {
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    setEditAvatar(user?.avatarUrl || "");
    setEditing(false);
    setApiError("");
    setListOpen(null);
  }, [user?.id]);

  // Render Followers/Following dialog
  function renderListDialog(kind) {
    const ids = kind === "followers" ? followers : following;
    return (
      <ListDialog onClick={e => e.stopPropagation()}>
        <ListDialogTitle>
          {kind === "followers" ? "Followers" : "Following"}
        </ListDialogTitle>
        {ids.length === 0 ? (
          <div style={{color:"#999",marginBottom:2}}>No users.</div>
        ) : (
          ids.map(uid => (
            <ListDialogItem key={uid}>
              {usersById[uid]?.name || "Anonymous"}
            </ListDialogItem>
          ))
        )}
        <CancelBtn style={{marginTop:10}} onClick={() => setListOpen(null)}>Close</CancelBtn>
      </ListDialog>
    );
  }

  // Profile editing handlers
  function handleStartEdit() {
    setEditing(true); setApiError("");
  }
  function handleCancelEdit() {
    setEditing(false); setEditName(user?.name || "");
    setEditBio(user?.bio || ""); setEditAvatar(user?.avatarUrl || "");
    setApiError("");
  }
  async function handleSaveEdit() {
    if (!editName.trim()) { setApiError("Name is required."); return; }
    setLoading(true);
    try {
      await updateUserProfile(user.id, {
        name: editName.trim(),
        bio: editBio,
        avatarUrl: editAvatar
      });
      setEditing(false);
      setApiError("");
      if (refreshProfile) refreshProfile(); // Reload parent state
    } catch {
      setApiError("Update failed.");
    }
    setLoading(false);
  }

  // Follow/unfollow logic
  const doIFollow = !!currentUser
    && !!user
    && following
    && following.includes(currentUser.id);

  // The correct meaning: is currentUser following the viewed user
  const iAmFollowing = !!currentUser
    && !!user
    && followers
    && followers.includes(currentUser.id);

  async function handleFollowToggle() {
    setFollowBusy(true);
    try {
      if (!iAmFollowing) {
        // Send follow request
        await followUser(currentUser.id, user.id);
      } else {
        await unfollowUser(currentUser.id, user.id);
      }
      // Refetch followers/following after
      fetchUserFollowers(user.id).then(setFollowers);
      fetchUserFollowing(user.id).then(setFollowing);
      if (refreshProfile) refreshProfile();
    } catch {
      setApiError("Failed to update follow.");
    }
    setFollowBusy(false);
  }

  if (!user) {
    return (
      <ProfileContainer>
        <div style={{ color: "#1976d2", fontSize: "1.18em" }}>
          User not found.
        </div>
      </ProfileContainer>
    );
  }
  return (
    <ProfileContainer>
      <div style={{ display: "flex", alignItems: "center", minHeight: 94, position:"relative" }}>
        {/* Avatar */}
        {editing ? (
          <div style={{marginRight:24}}>
            <label style={{ color: "#1976d2", fontWeight: 500, fontSize:14 }}>Avatar URL:</label>
            <AvatarEdit
              type="text"
              value={editAvatar}
              onChange={e => setEditAvatar(e.target.value)}
              placeholder="Link to avatar image"
            />
            {editAvatar && <Avatar src={editAvatar} alt="avatar" />}
          </div>
        ) : (
          user.avatarUrl && <Avatar src={user.avatarUrl} />
        )}
        <div style={{flex: 1, minWidth:0}}>
          <NameRow>
          {editing ? (
            <NameField value={editName} onChange={e=>setEditName(e.target.value)} />
          ) : (
            <span style={{ fontSize: "1.28rem", fontWeight: 700, color:"#1565c0" }}>{user.name}</span>
          )}
          {isMe && !editing &&
            <button style={{marginLeft:12, padding:"6px 15px",border:"none",borderRadius:8,background:"#e3f2fd",color:"#1976d2",fontSize:"1.04rem",fontWeight:700,cursor:"pointer"}}
              onClick={handleStartEdit}>Edit</button>
          }
          </NameRow>
          {editing ? (
            <BioEdit value={editBio} onChange={e=>setEditBio(e.target.value)} placeholder="Write your bio here" />
          ) : (
            <Bio>{user.bio || <span style={{color:"#bbb"}}>No bio provided.</span>}</Bio>
          )}
          <BtnRow>
            {/* Followers/following */}
            <CountLink onClick={() => setListOpen("followers")}><b>{followers.length}</b> Followers</CountLink>
            <CountLink onClick={() => setListOpen("following")}><b>{following.length}</b> Following</CountLink>
            {listOpen && renderListDialog(listOpen)}
            {/* Follow/unfollow controls */}
            {!isMe && isLoggedIn && (
              <FollowBtn
                following={Boolean(iAmFollowing)}
                onClick={handleFollowToggle}
                disabled={followBusy}
              >
                {iAmFollowing ? "Unfollow" : "Follow"}
              </FollowBtn>
            )}
          </BtnRow>
        </div>
      </div>
      {/* Error or save UI */}
      {editing && (
        <div style={{marginTop:9}}>
          <SaveBtn onClick={handleSaveEdit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </SaveBtn>
          <CancelBtn onClick={handleCancelEdit}>Cancel</CancelBtn>
          {apiError && <span style={{marginLeft:12,color:"#d32943"}}>{apiError}</span>}
        </div>
      )}
      <SectionTitle>Articles by {user.name}</SectionTitle>
      <ArticleList articles={myArticles} users={[user]} tags={tags} />
    </ProfileContainer>
  );
}
