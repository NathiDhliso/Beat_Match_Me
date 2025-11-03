import styles from './App.module.css'

const overviewTiles = [
  {
    title: 'Web Experience',
    body:
      'Vite, TypeScript, Tailwind, and modular styling form the baseline stack for the performer portal.',
  },
  {
    title: 'Mobile Experience',
    body:
      'Expo, NativeWind, and TypeScript power a unified request flow for iOS and Android audiences.',
  },
  {
    title: 'Scalable Infrastructure',
    body:
      'Amplify orchestrates deployment while AppSync, Cognito, and DynamoDB handle real-time workloads.',
  },
  {
    title: 'Media & Edge',
    body:
      'S3 anchors asset storage and CloudFront delivers low-latency experiences to every venue.',
  },
]

const deliveryBadges = ['React 19', 'TypeScript', 'Expo 54', 'NativeWind', 'AWS CDK-ready']

function App() {
  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.heading}>BeatMatchMe Delivery Foundation</h1>
        <p className={styles.subtitle}>
          Phase 0 completes baseline web, mobile, and cloud scaffolding so request journeys ship fast.
        </p>
        <div className={styles.grid}>
          {overviewTiles.map((tile) => (
            <div key={tile.title} className={styles.tile}>
              <div className={styles.tileTitle}>{tile.title}</div>
              <div className={styles.tileBody}>{tile.body}</div>
            </div>
          ))}
        </div>
        <div className={styles.badgeRow}>
          {deliveryBadges.map((badge) => (
            <span key={badge} className={styles.badge}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
