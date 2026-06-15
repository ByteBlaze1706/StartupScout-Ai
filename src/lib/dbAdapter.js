/**
 * @typedef {Object} UserRecord
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} passwordHash
 * @property {string} salt
 * @property {string} createdAt
 * @property {string} [resetToken]
 * @property {string} [resetTokenExpires]
 */

/**
 * @typedef {Object} ProjectRecord
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string} idea
 * @property {string} industry
 * @property {string} country
 * @property {string} targetAudience
 * @property {string} budget
 * @property {string} stage
 * @property {string} createdAt
 * @property {*} report
 * @property {number} [exportCount]
 */

/**
 * @typedef {Object} SessionRecord
 * @property {string} id
 * @property {string} userId
 * @property {string} createdAt
 * @property {string} expiresAt
 */

/**
 * @typedef {Object} DatabaseAdapter
 * @property {function(string): Promise<UserRecord|null>} getUserByEmail
 * @property {function(string): Promise<UserRecord|null>} getUserById
 * @property {function(UserRecord): Promise<void>} createUser
 * @property {function(UserRecord): Promise<void>} updateUser
 * @property {function(string): Promise<void>} deleteUser
 * @property {function(string): Promise<UserRecord|null>} getUserByResetToken
 * @property {function(string): Promise<SessionRecord|null>} getSession
 * @property {function(SessionRecord): Promise<void>} createSession
 * @property {function(string): Promise<void>} deleteSession
 * @property {function(): Promise<SessionRecord[]>} getAllSessions
 * @property {function(): Promise<number>} deleteExpiredSessions
 * @property {function(string): Promise<ProjectRecord|null>} getProjectById
 * @property {function(string): Promise<ProjectRecord[]>} getProjectsByUserId
 * @property {function(ProjectRecord): Promise<void>} saveProject
 * @property {function(string): Promise<void>} deleteProject
 * @property {function(string): Promise<void>} deleteProjectsByUserId
 */
