import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    query,
    where
  } from 'firebase/firestore';
  import { db } from '../lib/firebase';
  import { Tag } from '../types';
  
  export const TagService = {
    async saveTags(userId: string, tags: Tag[]) {
      try {
        const tagsRef = collection(db, `users/${userId}/tags`);
        
        // Get existing tags
        const snapshot = await getDocs(tagsRef);
        const existingTags = new Set(snapshot.docs.map(doc => doc.id));
        
        // Delete removed tags
        const newTagIds = new Set(tags.map(tag => tag.id));
        const deletedTags = Array.from(existingTags).filter(id => !newTagIds.has(id));
        
        await Promise.all(deletedTags.map(id => deleteDoc(doc(tagsRef, id))));
        
        // Save new/updated tags
        await Promise.all(
          tags.map(tag => setDoc(doc(tagsRef, tag.id), tag))
        );
      } catch (error) {
        console.error('Error saving tags:', error);
        throw error;
      }
    },
  
    async loadTags(userId: string): Promise<Tag[]> {
      try {
        const tagsRef = collection(db, `users/${userId}/tags`);
        const snapshot = await getDocs(tagsRef);
        return snapshot.docs.map(doc => ({ ...doc.data() } as Tag));
      } catch (error) {
        console.error('Error loading tags:', error);
        throw error;
      }
    },
  };