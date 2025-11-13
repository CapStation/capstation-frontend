# CapStation - Business Logic & Page Requirements

## 📋 Table of Contents
1. [Documents Admin Page](#documents-admin-page)
2. [Announcements Management](#announcements-management)
3. [Groups Management](#groups-management)
4. [User Profile](#user-profile)
5. [Browse Capstones Detail](#browse-capstones-detail)
6. [Request & Decision System](#request--decision-system)

---

## 1. Documents Admin Page

### 🎯 **Purpose**
Halaman khusus untuk Dosen/Admin untuk mereview, filter, dan mengelola semua dokumen capstone dari semua mahasiswa.

### 👥 **User Roles**
- **Dosen**: View & review documents dari mahasiswa bimbingannya
- **Admin**: View & manage semua documents di sistem

### 📄 **Page: `/documents` atau `/admin/documents`**

#### **UI Components:**
1. **Header Section**
   - Title: "Manajemen Dokumen Capstone"
   - Subtitle: "Review dan kelola dokumen mahasiswa"
   - Total documents count badge

2. **Filter Section** (Sticky/Fixed)
   - **Search Bar**: Search by filename, project name, or student name
   - **Filter by Project Status**:
     - [ ] Semua Status
     - [ ] Disetujui
     - [ ] Sedang Proses
     - [ ] Ditolak
   - **Filter by Document Type**:
     - [ ] Proposal
     - [ ] Progress Report
     - [ ] Final Report
     - [ ] Presentation
     - [ ] Lainnya
   - **Filter by Date Range**: 
     - From: [Date Picker]
     - To: [Date Picker]
   - **Filter by Student/Group**:
     - Dropdown with search
   - **Sort By**:
     - Upload Date (Newest/Oldest)
     - File Size
     - Project Name
     - Student Name

3. **Documents Table/Grid**
   ```
   ┌─────────────────────────────────────────────────────────────────────┐
   │ [Filter Bar with chips showing active filters]                      │
   ├─────────────────────────────────────────────────────────────────────┤
   │ Document Name | Project | Student | Upload Date | Size | Actions    │
   ├─────────────────────────────────────────────────────────────────────┤
   │ Proposal.pdf  | IoT...  | John    | 27 Mei 2026 | 2.4MB| 👁 📥 🗑  │
   │ Report.docx   | AI...   | Jane    | 25 Mei 2026 | 1.8MB| 👁 📥 🗑  │
   └─────────────────────────────────────────────────────────────────────┘
   ```

4. **Action Buttons per Document**:
   - **👁 View/Preview**: Quick preview modal
   - **📥 Download**: Download file
   - **🗑 Delete**: Delete (admin only, with confirmation)
   - **✓ Approve/Reject**: For dosen review

5. **Pagination**
   - Show: 10 / 25 / 50 / 100 items per page
   - Page navigation: « ‹ 1 2 3 › »

#### **Features & Interactions:**

**1. Search & Filter**
```javascript
// Debounced search
const handleSearch = debounce((query) => {
  fetchDocuments({ search: query, ...filters });
}, 500);

// Apply filters
const applyFilters = () => {
  const params = {
    status: selectedStatus,
    type: selectedType,
    dateFrom: startDate,
    dateTo: endDate,
    studentId: selectedStudent,
    sortBy: sortOption,
  };
  fetchDocuments(params);
};
```

**2. Bulk Actions** (Optional)
- [ ] Select multiple documents
- Bulk Download (zip)
- Bulk Delete (admin only)

**3. Document Preview Modal**
```
┌──────────────────────────────────────────┐
│ [X] Close                                │
│                                          │
│  📄 Document Preview                     │
│  ─────────────────────────────          │
│  Filename: Proposal_IoT.pdf              │
│  Project: Sistem Monitoring...           │
│  Student: John Doe (22/123456)           │
│  Upload Date: 27 Mei 2026                │
│  Size: 2.4 MB                            │
│                                          │
│  [PDF/Image Preview Area]                │
│                                          │
│  [Download] [Delete]                     │
└──────────────────────────────────────────┘
```

**4. Statistics Dashboard** (Optional)
- Total documents count
- Documents by status (chart)
- Recent uploads
- Storage usage

#### **API Endpoints Required:**
```javascript
// Get all documents with filters
GET /api/documents?search=&status=&type=&dateFrom=&dateTo=&page=1&limit=25

// Get document detail
GET /api/documents/:id

// Download document
GET /api/documents/:id/download

// Delete document (admin only)
DELETE /api/documents/:id

// Approve/Reject document (dosen)
PATCH /api/documents/:id/review
Body: { status: 'approved' | 'rejected', notes: '' }
```

#### **State Management:**
```javascript
const [documents, setDocuments] = useState([]);
const [filters, setFilters] = useState({
  search: '',
  status: '',
  type: '',
  dateFrom: null,
  dateTo: null,
  studentId: '',
  sortBy: 'newest'
});
const [pagination, setPagination] = useState({
  page: 1,
  limit: 25,
  total: 0
});
const [loading, setLoading] = useState(false);
```

---

## 2. Announcements Management

### 🎯 **Purpose**
Halaman untuk Dosen/Admin membuat, edit, dan publish pengumuman untuk mahasiswa.

### 👥 **User Roles**
- **Dosen**: Create & publish announcements untuk mahasiswa bimbingannya
- **Admin**: Create & publish global announcements
- **Mahasiswa**: Read-only (view di Dashboard)

### 📄 **Pages:**

#### **A. `/announcements` - List Announcements**

**UI Components:**

1. **Header**
   - Title: "Pengumuman Capstone"
   - [+ Buat Pengumuman Baru] button (dosen/admin only)

2. **Tabs**
   - **Semua Pengumuman**
   - **Draft** (unpublished)
   - **Published**
   - **Archived**

3. **Announcement Cards**
   ```
   ┌─────────────────────────────────────────────────────┐
   │ 📢 Jadwal Bimbingan Capstone 2026                   │
   │ ───────────────────────────────────────────────────  │
   │ Yth. Mahasiswa DTETI UGM. Diberitahukan bahwa...    │
   │                                                      │
   │ 👤 Admin DTETI • 📅 10 Januari 2026                 │
   │ 🏷️ Bimbingan, Jadwal                                │
   │                                                      │
   │ [Edit] [Delete] [Archive] [View Stats]              │
   └─────────────────────────────────────────────────────┘
   ```

4. **Actions per Announcement**:
   - **Edit**: Go to edit page
   - **Delete**: Soft delete with confirmation
   - **Archive**: Move to archived
   - **View Stats**: See read count, engagement

#### **B. `/announcements/new` - Create Announcement**

**Form Fields:**

1. **Basic Information**
   - **Title*** (required, max 200 chars)
   - **Content*** (required, rich text editor)
     - Support: Bold, Italic, Lists, Links, Images
   - **Category/Tags**: Multi-select
     - Bimbingan
     - Jadwal
     - Pengumuman Umum
     - Deadline
     - Event

2. **Visibility Settings**
   - **Target Audience**:
     - [ ] Semua Mahasiswa
     - [ ] Mahasiswa Bimbingan Saya (dosen)
     - [ ] Specific Groups (select multiple)
   - **Priority Level**:
     - 🔴 High (Urgent)
     - 🟡 Medium (Important)
     - ⚪ Normal

3. **Schedule Publishing**
   - [ ] Publish Immediately
   - [ ] Schedule for later
     - Date: [Date Picker]
     - Time: [Time Picker]

4. **Attachments** (Optional)
   - Upload PDF, images, etc.
   - Max 5 files, 10MB each

5. **Notification Settings**
   - [ ] Send email notification
   - [ ] Send push notification
   - [ ] Pin to top of dashboard

**Actions:**
- [Simpan sebagai Draft]
- [Preview]
- [Publish Pengumuman]

#### **C. `/announcements/[id]/edit` - Edit Announcement**
Same as create, but pre-filled with existing data.

#### **D. `/announcements/[id]` - View Detail**

**Display:**
- Full announcement content
- Metadata (author, date, category)
- Attachments list
- Read statistics (if admin/dosen)
  - Total views: 150
  - Unique readers: 120
  - Read rate: 80%
  - List of students who read/haven't read

**Actions:**
- [Edit] [Delete] [Share Link]

#### **Features & Logic:**

**1. Rich Text Editor**
```javascript
import { useEditor } from '@tiptap/react';

const editor = useEditor({
  extensions: [
    StarterKit,
    Link,
    Image,
  ],
  content: announcement.content,
});
```

**2. Draft Auto-save**
```javascript
// Auto-save draft every 30 seconds
useEffect(() => {
  const timer = setInterval(() => {
    if (isDirty) {
      saveDraft(formData);
    }
  }, 30000);
  return () => clearInterval(timer);
}, [formData, isDirty]);
```

**3. Read Tracking**
```javascript
// Mark as read when student views
useEffect(() => {
  if (user.role === 'student') {
    markAsRead(announcementId);
  }
}, [announcementId]);
```

#### **API Endpoints:**
```javascript
// List announcements
GET /api/announcements?status=published&category=&page=1

// Create announcement
POST /api/announcements
Body: { title, content, category, targetAudience, priority, scheduledAt }

// Update announcement
PUT /api/announcements/:id

// Delete announcement
DELETE /api/announcements/:id

// Get announcement stats
GET /api/announcements/:id/stats

// Mark as read
POST /api/announcements/:id/read
```

---

## 3. Groups Management

### 🎯 **Purpose**
Mahasiswa membentuk dan mengelola grup capstone. Grup terdiri dari 2-4 mahasiswa yang mengerjakan proyek bersama.

### 👥 **User Roles**
- **Mahasiswa**: Create, join, manage own groups
- **Dosen**: View groups, assign supervisors
- **Admin**: Manage all groups

### 📄 **Pages:**

#### **A. `/groups` - My Groups**

**UI Components:**

1. **Header**
   - Title: "Grup Capstone Saya"
   - [+ Buat Grup Baru] button

2. **My Groups List**
   ```
   ┌──────────────────────────────────────────────────────┐
   │ 👥 Grup IoT Healthcare                               │
   │ ─────────────────────────────────────────────────    │
   │ Proyek: Sistem Monitoring Tekanan Darah...           │
   │ Anggota: 3/4 • Pembimbing: Prof. Dr. Eng...         │
   │                                                      │
   │ 👤 John Doe (Leader)                                 │
   │ 👤 Jane Smith                                        │
   │ 👤 Bob Johnson                                       │
   │ ➕ [Invite Member]                                   │
   │                                                      │
   │ [View Details] [Leave Group] [Settings]              │
   └──────────────────────────────────────────────────────┘
   ```

3. **Available Groups to Join** (if user has no group)
   - List of open groups looking for members
   - Show: Group name, project, current members, leader
   - [Request to Join] button

#### **B. `/groups/new` - Create New Group**

**Form:**

1. **Group Information**
   - **Group Name*** (required, unique)
   - **Project/Topic*** (required)
   - **Description**: What is the project about?
   - **Max Members**: 2-4 members (default 4)

2. **Initial Members** (Optional)
   - Search and invite students by:
     - Name
     - NIM
     - Email
   - Add up to 3 members initially
   - Can invite more later

3. **Group Settings**
   - **Visibility**:
     - [ ] Public (anyone can request to join)
     - [ ] Private (invite-only)
   - **Auto-approve join requests**: Yes/No

**Actions:**
- [Create Group & Send Invites]
- [Cancel]

#### **C. `/groups/[id]` - Group Detail**

**Sections:**

1. **Group Info**
   - Group name
   - Project name & description
   - Created date
   - Group leader badge

2. **Members List**
   ```
   ┌────────────────────────────────────────────┐
   │ 👤 John Doe         [Leader] [Profile]    │
   │    NIM: 22/123456   john@mail.ugm.ac.id   │
   │                                            │
   │ 👤 Jane Smith                [Profile]    │
   │    NIM: 22/123457   jane@mail.ugm.ac.id   │
   │                     [Remove] (if leader)   │
   └────────────────────────────────────────────┘
   ```

3. **Pending Invitations**
   - List of invited members who haven't accepted
   - [Cancel Invitation] button

4. **Join Requests** (if public group)
   - Students who requested to join
   - [Accept] [Reject] buttons

5. **Group Project**
   - Link to associated capstone project
   - Quick access to documents
   - Project status badge

6. **Actions** (if leader):
   - [Edit Group Info]
   - [Invite Member]
   - [Transfer Leadership]
   - [Disband Group] (with confirmation)

7. **Actions** (if member):
   - [Leave Group] (with confirmation)

#### **D. `/groups/[id]/settings` - Group Settings**

**Settings:**

1. **Basic Info** (leader only)
   - Edit group name
   - Edit description
   - Edit visibility

2. **Member Management** (leader only)
   - Promote member to co-leader
   - Remove member
   - Transfer leadership

3. **Notifications**
   - Email on new member join
   - Email on new join request
   - Email on project updates

#### **Features & Logic:**

**1. Group Invitation System**
```javascript
// Send invitation
const inviteMember = async (userId) => {
  await groupService.inviteMember(groupId, userId);
  // Notification sent to invited user
};

// Accept invitation
const acceptInvitation = async (invitationId) => {
  await groupService.acceptInvitation(invitationId);
  // User added to group
  // Other group members notified
};
```

**2. Join Request Flow**
```javascript
// Student requests to join
const requestJoin = async (groupId) => {
  await groupService.requestJoin(groupId);
  // Notification sent to group leader
};

// Leader approves/rejects
const handleJoinRequest = async (requestId, action) => {
  await groupService.handleJoinRequest(requestId, action);
  // Student notified of decision
};
```

**3. Leave Group**
```javascript
// Member leaves
const leaveGroup = async () => {
  if (isLeader && members.length > 1) {
    // Must transfer leadership first
    return showError('Transfer leadership first');
  }
  await groupService.leaveGroup(groupId);
  router.push('/groups');
};
```

**4. Group Validation Rules**
- Minimum 2 members to finalize group
- Maximum 4 members
- One student can only be in one group per semester
- Group leader can't leave without transferring leadership
- Group must have assigned project

#### **API Endpoints:**
```javascript
// List my groups
GET /api/groups/my

// List available groups to join
GET /api/groups/available

// Create group
POST /api/groups
Body: { name, projectId, description, maxMembers, visibility }

// Get group detail
GET /api/groups/:id

// Invite member
POST /api/groups/:id/invite
Body: { userId }

// Accept invitation
POST /api/groups/invitations/:id/accept

// Request to join
POST /api/groups/:id/join-request

// Handle join request
POST /api/groups/:id/join-requests/:requestId/handle
Body: { action: 'accept' | 'reject' }

// Update group
PUT /api/groups/:id

// Leave group
DELETE /api/groups/:id/leave

// Remove member (leader only)
DELETE /api/groups/:id/members/:userId

// Transfer leadership
POST /api/groups/:id/transfer-leadership
Body: { newLeaderId }

// Disband group (leader only)
DELETE /api/groups/:id
```

---

## 4. User Profile

### 🎯 **Purpose**
Mahasiswa dapat melihat dan mengedit profil mereka, termasuk competencies.

### 📄 **Page: `/profile` atau `/profile/[userId]`**

**Sections:**

1. **Profile Header**
   ```
   ┌─────────────────────────────────────────────────────┐
   │     [Avatar]                                        │
   │     Upload Photo                                    │
   │                                                     │
   │  John Doe                           [Edit Profile] │
   │  NIM: 22/123456                                     │
   │  Teknik Elektro - S1                                │
   │  john.doe@mail.ugm.ac.id                           │
   └─────────────────────────────────────────────────────┘
   ```

2. **About / Bio**
   - Short bio (max 500 chars)
   - Interests
   - Skills/Expertise

3. **Academic Information**
   - Program Studi
   - Angkatan
   - Semester
   - IPK (optional, private)

4. **Competencies** (Skills Matrix)
   ```
   ┌──────────────────────────────────────────────┐
   │ 💻 Programming                               │
   │ ⭐⭐⭐⭐⭐ Python                              │
   │ ⭐⭐⭐⭐☆ JavaScript                          │
   │ ⭐⭐⭐☆☆ C++                                  │
   │                                              │
   │ [+ Add Competency]                           │
   └──────────────────────────────────────────────┘
   ```

5. **My Projects**
   - List of capstone projects
   - Link to each project detail

6. **My Groups**
   - Current groups
   - Role in each group

7. **Activity Timeline** (Optional)
   - Recent documents uploaded
   - Project updates
   - Announcements read

**Edit Mode:**

Form fields:
- Name
- Bio/About
- Phone number
- LinkedIn profile (optional)
- GitHub profile (optional)
- Portfolio website (optional)

**Competencies Management:**
- Add new competency: [Category] [Skill Name] [Level 1-5]
- Edit existing
- Remove competency

#### **API Endpoints:**
```javascript
// Get user profile
GET /api/users/:id

// Update profile
PUT /api/users/profile
Body: { name, bio, phone, linkedin, github, website }

// Upload avatar
POST /api/users/avatar
Body: FormData with image

// Get competencies
GET /api/users/:id/competencies

// Add competency
POST /api/users/competencies
Body: { category, skill, level }

// Update competency
PUT /api/users/competencies/:id
Body: { level }

// Delete competency
DELETE /api/users/competencies/:id
```

---

## 5. Browse Capstones Detail

### 📄 **Page: `/browse/capstones/[id]`**

**Purpose**: View detailed information about a specific capstone project from browse page.

**Sections:**

1. **Project Header**
   - Project title
   - Status badge (Tersedia / Tidak Tersedia)
   - Created date
   - Category tags

2. **Project Description**
   - Full description
   - Problem statement
   - Proposed solution
   - Expected outcome

3. **Technical Details**
   - Technologies used
   - Requirements
   - Prerequisites
   - Complexity level

4. **Supervisor/Mentor**
   - Dosen pembimbing
   - Contact info
   - Office hours

5. **Related Documents**
   - Proposal (if public)
   - References
   - Previous work

6. **Call to Action**
   - [Request to Take This Project] button
   - [Contact Supervisor] button
   - [Add to Wishlist] button

---

## 6. Request & Decision System

### 🎯 **Purpose**
Mahasiswa submit request untuk berbagai hal, dosen/admin membuat keputusan.

### 📄 **Pages:**

#### **A. `/requests` - My Requests (Student)**

**Request Types:**
1. Project approval request
2. Supervisor change request
3. Topic change request
4. Extension request (deadline)
5. Group change request

**UI:**
```
┌────────────────────────────────────────────────────┐
│ 📝 Request Persetujuan Proyek                     │
│ Status: ⏳ Pending Review                          │
│ Diajukan: 25 Mei 2026                             │
│                                                    │
│ Proyek: Sistem Monitoring IoT...                  │
│ Kepada: Prof. Dr. Eng. Ahmad                      │
│                                                    │
│ [View Details] [Cancel Request]                   │
└────────────────────────────────────────────────────┘
```

#### **B. `/requests/new` - Submit Request**

**Form:**
- Request Type (dropdown)
- Subject
- Description/Reason
- Attachments (optional)
- Priority

#### **C. `/admin/requests` - Manage Requests (Dosen/Admin)**

**Features:**
- List all pending requests
- Filter by type, status, student
- Approve/Reject with notes
- Bulk actions

---

## 🎨 Common UI Patterns

### **1. Empty State**
```
┌──────────────────────────────────┐
│         [Icon]                   │
│                                  │
│    Belum Ada Data                │
│    Mulai dengan membuat...       │
│                                  │
│    [Primary Action Button]       │
└──────────────────────────────────┘
```

### **2. Loading State**
- Skeleton loaders
- Spinner for actions
- Progress bars for uploads

### **3. Error State**
- Toast notifications
- Inline error messages
- Error boundaries

### **4. Confirmation Dialogs**
```
┌──────────────────────────────────┐
│ ⚠️  Konfirmasi                   │
│                                  │
│ Apakah Anda yakin ingin          │
│ menghapus item ini?              │
│                                  │
│ [Batal]  [Ya, Hapus]            │
└──────────────────────────────────┘
```

### **5. Success Feedback**
- Toast notification: "✓ Berhasil!"
- Redirect to relevant page
- Update UI immediately

---

## 🔐 Permission Matrix

| Feature | Student | Dosen | Admin |
|---------|---------|-------|-------|
| View Documents | Own only | Bimbingan | All |
| Upload Documents | ✓ | ✗ | ✗ |
| Delete Documents | Own only | ✗ | ✓ |
| Create Announcements | ✗ | ✓ | ✓ |
| Manage Groups | Own only | View | All |
| Approve Requests | ✗ | ✓ | ✓ |
| View Statistics | Basic | Advanced | Full |

---

## 📱 Responsive Design Priorities

### **Mobile First:**
1. Navigation: Bottom tab bar or hamburger menu
2. Cards: Stack vertically
3. Tables: Convert to cards or horizontal scroll
4. Filters: Collapsible drawer
5. Forms: Single column, larger inputs

### **Desktop Enhancements:**
1. Multi-column layouts
2. Sidebar navigation
3. Data tables with sorting
4. Hover states & tooltips
5. Keyboard shortcuts

---

## 🚀 Implementation Priority

### **Phase 1 (MVP):**
1. ✅ Authentication & Dashboard
2. ✅ Projects CRUD
3. ✅ Browse Capstones
4. 🔄 Groups Management (basic)
5. 🔄 Documents Admin (basic)

### **Phase 2 (Enhanced):**
1. Announcements Management
2. User Profile & Competencies
3. Advanced filters & search
4. Statistics & analytics

### **Phase 3 (Advanced):**
1. Request & Decision System
2. Notifications system
3. Real-time updates
4. Export/Import features
5. Mobile app (PWA)

---

## 📊 Success Metrics

1. **User Engagement:**
   - Daily active users
   - Average session duration
   - Feature usage rate

2. **Performance:**
   - Page load time < 2s
   - API response time < 500ms
   - Upload success rate > 95%

3. **User Satisfaction:**
   - Task completion rate
   - Error rate < 5%
   - User feedback score > 4/5

---

**Generated on:** 2025-11-12
**Version:** 1.0
**Last Updated By:** GitHub Copilot
