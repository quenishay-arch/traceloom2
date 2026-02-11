//
//  index.ts
//  traceloom
//
//  Created by Quenisha Yovela on 11/2/2026.
//


export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}