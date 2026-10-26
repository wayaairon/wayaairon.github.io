import type { Metadata } from 'next';
import Guestbook from '@/components/guestbook/Guestbook';
export const metadata:Metadata={title:'Guestbook',description:'Leave a little hello for Wenyu. A guestbook for kind words and curious minds.'};
export default function GuestbookPage(){return <Guestbook/>}
