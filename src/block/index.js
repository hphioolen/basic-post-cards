/**
 * BLOCK: basic-post-cards
 *
 */
import { __ } from '@wordpress/i18n';
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks

//  Import CSS.
import './editor.scss';
import './style.scss';

/**
 * Internal dependencies
 */
import edit from './edit'; // 		#Door "edit" te importeren, kan die als woord worden toegevoegd aan de RegisterBlockType hieronder. Normaal ook een "save" nodig, maar dit is een dynamsich blok
// import icon from './icon'; // 	#hiermee heeft WP een standaard importer voor een SVG icoon gemaakt. misschie gebruiken?

registerBlockType( 'indrukwekkend/latest-posts', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Grid Posts' ), // Block title.
	icon: 'grid-view', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'common', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	supports: {
		align: [ 'wide', 'full' ],
		html: false,
	},
	keywords: [
		__( 'recent posts grid' ),
	],
	edit,
} );

//kijk naar de import methode van WP core blocks om ondertaande te gebruiken:
//export const name = 'indrukwekkend/latest-posts';

// export const settings = {
// 	title: __( 'Grid posts' ),
// 	description: __( 'Display a grid of your most recent posts.' ),
// 	icon: 'excerpt-view',
// 	keywords: [ __( 'recent posts' ) ],
// 	supports: {
// 		align: [ 'wide', 'full' ],
// 		html: false,
// 	},
// 	edit,
// };
