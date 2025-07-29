import { Button } from '@saga/ui/button';
import Link from 'next/link';
import styles from '../page.module.css';

export default function TrpcApiPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>tRPC API Example</h1>
        <p className={styles.description}>
          This page demonstrates integration with the tRPC API example from saga-soa.
        </p>
        
        <div className={styles.content}>
          <h2>Available Procedures</h2>
          <ul>
            <li><code>project.getAll</code> - Get all projects</li>
            <li><code>project.getById</code> - Get project by ID</li>
            <li><code>project.create</code> - Create new project</li>
            <li><code>run.getAll</code> - Get all runs</li>
            <li><code>run.getById</code> - Get run by ID</li>
            <li><code>run.create</code> - Create new run</li>
          </ul>
          
          <p>
            The tRPC API example demonstrates:
          </p>
          <ul>
            <li>Type-safe API with tRPC</li>
            <li>End-to-end type safety</li>
            <li>Router-based architecture</li>
            <li>Playground for API exploration</li>
          </ul>
        </div>

        <div className={styles.ctas}>
          <Button appName="web-client" className={styles.primary}>
            Test tRPC Procedures
          </Button>
          <Link
            href="/"
            className={styles.secondary}
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
} 