import { Heart } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.brand}>
                    <span className={styles.logo}>💰</span>
                    <span className={styles.name}>WealthWise</span>
                </div>

                <p className={styles.copyright}>
                    © {currentYear} WealthWise. Made with <Heart size={14} className={styles.heart} /> in India
                </p>

                <div className={styles.version}>
                    v1.0.0
                </div>
            </div>
        </footer>
    );
};

export default Footer;
